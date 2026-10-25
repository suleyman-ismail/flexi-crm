import {
  AppData,
  ClientCard,
  WorkspaceId,
  PadDocument,
  ChatConv,
  ChatMessage,
} from '../types/crm';
import {
  DEMO_APP_DATA_FLEXI,
  DEMO_APP_DATA_RENO,
  buildDemoClientCard,
  buildDefaultChecklistPad,
  DEMO_CONVS,
  DEMO_MESSAGES,
} from './mockData';

export const GAS_API_URL =
  'https://script.google.com/macros/s/AKfycbwsUVFw9bRxnsx_NDtJfZDOlU8iE6Br91SEhCP7z4Jn-Y223ytToFbdM00Rb2DXMLn55w/exec';

const READ_ONLY_FNS = new Set([
  'getAppData',
  'getClient',
  'getMedia',
  'getPhoto',
  'getFile',
  'getAllCards',
  'admGet',
  'admShow',
  'getNotif',
  'pushSub',
  'pushUnsub',
  'pushTest',
  'finGet',
  'padGet',
  'padMe',
  'bg',
  'ping',
  'cSearch',
  'analytics',
  'mailsGet',
  'login',
  'bossGet',
  'msgList',
  'msgGet',
  'gSearch',
]);

// Performance telemetry queue sent piggyback (`pf`) just like native backend expects
let perfQueue: [string, number][] = [];
let bgTimer: ReturnType<typeof setTimeout> | null = null;

export function newRequestId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
  }
}

// ---------- IndexedDB ('flexi-crm') Offline Storage & Mutation Queue ----------
function openFlexiDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('flexi-crm', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
        if (!db.objectStoreNames.contains('q')) {
          db.createObjectStore('q', { autoIncrement: true });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function idbGet<T = unknown>(key: string): Promise<T | null> {
  const db = await openFlexiDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('kv', 'readonly').objectStore('kv').get(key);
      tx.onsuccess = () => resolve((tx.result as T) ?? null);
      tx.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function idbSet(key: string, val: unknown): Promise<void> {
  const db = await openFlexiDb();
  if (!db) return;
  try {
    const store = db.transaction('kv', 'readwrite').objectStore('kv');
    if (val === null || val === undefined) store.delete(key);
    else store.put(val, key);
  } catch {
    // ignore quota errors
  }
}

export interface QueuedMutation {
  id?: number;
  fn: string;
  args: unknown[];
  ws: WorkspaceId;
  rid: string;
  t: number;
}

export async function queueAddMutation(
  fn: string,
  args: unknown[],
  ws: WorkspaceId,
  rid?: string
): Promise<number> {
  const db = await openFlexiDb();
  if (!db) return 0;
  return new Promise((resolve) => {
    try {
      const store = db.transaction('q', 'readwrite').objectStore('q');
      store.add({ fn, args, ws, rid: rid || newRequestId(), t: Date.now() });
      const cnt = store.count();
      cnt.onsuccess = () => resolve(cnt.result || 0);
      cnt.onerror = () => resolve(0);
    } catch {
      resolve(0);
    }
  });
}

export async function queueGetCount(): Promise<number> {
  const db = await openFlexiDb();
  if (!db) return 0;
  return new Promise((resolve) => {
    try {
      const cnt = db.transaction('q', 'readonly').objectStore('q').count();
      cnt.onsuccess = () => resolve(cnt.result || 0);
      cnt.onerror = () => resolve(0);
    } catch {
      resolve(0);
    }
  });
}

export async function queueFlushAll(
  token: string,
  onProgress?: (remaining: number) => void
): Promise<void> {
  if (!token || token === 'DEMO_TOKEN' || !navigator.onLine) return;
  const db = await openFlexiDb();
  if (!db) return;

  const items: { key: IDBValidKey; val: QueuedMutation }[] = await new Promise((res) => {
    const out: { key: IDBValidKey; val: QueuedMutation }[] = [];
    try {
      const cur = db.transaction('q', 'readonly').objectStore('q').openCursor();
      cur.onsuccess = () => {
        const c = cur.result;
        if (c) {
          out.push({ key: c.key, val: c.value as QueuedMutation });
          c.continue();
        } else res(out);
      };
      cur.onerror = () => res(out);
    } catch {
      res(out);
    }
  });

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      await gasApiCall(item.val.fn, item.val.args, {
        token,
        ws: item.val.ws,
        rid: item.val.rid,
        skipQueue: true,
      });
      await new Promise<void>((res) => {
        const del = db.transaction('q', 'readwrite').objectStore('q').delete(item.key);
        del.onsuccess = () => res();
        del.onerror = () => res();
      });
      onProgress?.(items.length - 1 - i);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'offline' in err) break;
      // Non-network error: remove poison item so queue doesn't stall forever
      await new Promise<void>((res) => {
        const del = db.transaction('q', 'readwrite').objectStore('q').delete(item.key);
        del.onsuccess = () => res();
        del.onerror = () => res();
      });
    }
  }
}

// ---------- Core Type-Safe Google Apps Script RPC Client ----------
export interface ApiCallOptions {
  token?: string;
  ws?: WorkspaceId;
  rid?: string;
  skipQueue?: boolean;
  onLatency?: (ms: number) => void;
}

export async function gasApiCall<T = unknown>(
  fn: string,
  args: unknown[] = [],
  opts: ApiCallOptions = {}
): Promise<T> {
  const token = opts.token ?? localStorage.getItem('crm_tok') ?? '';
  const ws = opts.ws ?? ((localStorage.getItem('crm_ws') as WorkspaceId) || '');

  // Demo Mode Interceptor for instant interactive testing
  if (token === 'DEMO_TOKEN') {
    const t0 = performance.now();
    await new Promise((r) => setTimeout(r, 140));
    opts.onLatency?.(Math.round(performance.now() - t0));
    return handleDemoRpc(fn, args, ws) as T;
  }

  const t0 = Date.now();
  const pk = (ws ? ws + ':' : '') + fn;
  const body: Record<string, unknown> = {
    fn,
    args,
    token,
    ws,
  };
  if (opts.rid) body.rid = opts.rid;
  if (fn !== 'login' && perfQueue.length > 0) {
    body.pf = perfQueue.splice(0, 40);
  }

  const bodyStr = JSON.stringify(body);
  let res: Response;
  try {
    res = await fetch(GAS_API_URL, {
      method: 'POST',
      body: bodyStr,
      keepalive: bodyStr.length < 60000,
    });
  } catch {
    const err = new Error('Няма връзка с интернет') as Error & { offline?: boolean };
    err.offline = true;
    if (!READ_ONLY_FNS.has(fn) && !opts.skipQueue) {
      await queueAddMutation(fn, args, ws, opts.rid);
    }
    throw err;
  }

  if (!res.ok) {
    const err = new Error(`Сървърът не отговаря (${res.status})`) as Error & {
      offline?: boolean;
    };
    if (res.status >= 500 || res.status === 429) err.offline = true;
    throw err;
  }

  const json = await res.json();
  const elapsed = Date.now() - t0;
  opts.onLatency?.(elapsed);
  perfQueue.push([pk, elapsed]);
  if (perfQueue.length > 60) perfQueue = perfQueue.slice(-60);

  if (!json.ok) {
    if (json.error === 'AUTH') {
      throw new Error('AUTH');
    }
    throw new Error(json.error || 'Грешка от сървъра');
  }

  if (!READ_ONLY_FNS.has(fn)) {
    if (bgTimer) clearTimeout(bgTimer);
    bgTimer = setTimeout(() => {
      gasApiCall('bg', [], { token, ws, skipQueue: true }).catch(() => {});
    }, 1500);
  }

  return json.data as T;
}

// ---------- Demo Mode Local State Handler ----------
function handleDemoRpc(fn: string, args: unknown[], ws: WorkspaceId): unknown {
  const baseData = ws === 'r' ? DEMO_APP_DATA_RENO : DEMO_APP_DATA_FLEXI;
  if (fn === 'getAppData') {
    const saved = localStorage.getItem(`demo_app_${ws || 'm'}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return baseData;
  }
  if (fn === 'getClient') {
    const clientName = String(args[0] || '');
    const savedCard = localStorage.getItem(`demo_card_${ws || 'm'}_${clientName.toLowerCase()}`);
    if (savedCard) {
      try {
        return JSON.parse(savedCard);
      } catch {
        // fallback
      }
    }
    return buildDemoClientCard(clientName, ws);
  }
  if (fn === 'padGet') {
    const rawArg = String(args[0] || '');
    const clientName = rawArg.replace(/^c:/i, '');
    const key = `crm_pad${ws ? '_' + ws : ''}:${clientName.toLowerCase()}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const c = baseData.clients.find((x) => x.n.toLowerCase() === clientName.toLowerCase());
    const doc = buildDefaultChecklistPad(c?.m || 'Flexi 120 м²', ws);
    localStorage.setItem(key, JSON.stringify(doc));
    return doc;
  }
  if (fn === 'padSave') {
    const rawArg = String(args[0] || '');
    const clientName = rawArg.replace(/^c:/i, '');
    const body = args[1] as PadDocument;
    const key = `crm_pad${ws ? '_' + ws : ''}:${clientName.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(body));
    return body;
  }
  if (fn === 'msgList' || fn === 'chatList') {
    return {
      un: DEMO_CONVS.reduce((s, c) => s + c.un, 0),
      team: ['Сюлейман', 'Елена', 'Мартин', 'Хасан'],
      conv: DEMO_CONVS,
      convs: DEMO_CONVS,
    };
  }
  if (fn === 'msgGet' || fn === 'chatOpen') {
    const rawPeer = String(args[0] || 'g:all');
    const convId = rawPeer === '*' ? 'g:all' : rawPeer;
    const list = DEMO_MESSAGES[convId] || DEMO_MESSAGES['g:all'] || [];
    return {
      items: list,
      msgs: list,
      members: ['Сюлейман', 'Елена', 'Мартин', 'Хасан'],
      rt: { Елена: Date.now(), Мартин: Date.now() },
    };
  }
  if (fn === 'msgSend' || fn === 'chatSend') {
    const rawPeer = String(args[0] || 'g:all');
    const convId = rawPeer === '*' ? 'g:all' : rawPeer;
    const text = String(args[1] || '');
    const list = DEMO_MESSAGES[convId] || [];
    const nextMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      t: Date.now(),
      f: 'Сюлейман',
      x: text,
      r: 1,
    };
    DEMO_MESSAGES[convId] = [...list, nextMsg];
    return { items: DEMO_MESSAGES[convId], msgs: DEMO_MESSAGES[convId] };
  }
  return { ok: true };
}

// ---------- Client-Side WebP Multi-Photo Compressor ----------
export interface CompressedWebPResult {
  fileName: string;
  originalBytes: number;
  compressedBytes: number;
  savingsPercent: number;
  viewDataUrl: string; // 1600px max WebP
  thumbDataUrl: string; // 360px max WebP
  blob: Blob;
}

export async function compressImageToWebP(
  file: File,
  maxDim = 1600,
  quality = 0.82
): Promise<CompressedWebPResult> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.width;
        const h = img.height;
        const scaleView = Math.min(1, maxDim / Math.max(w, h));
        const vw = Math.max(1, Math.round(w * scaleView));
        const vh = Math.max(1, Math.round(h * scaleView));

        const cv = document.createElement('canvas');
        cv.width = vw;
        cv.height = vh;
        const ctx = cv.getContext('2d');
        if (!ctx) throw new Error('Canvas context unavailable');
        ctx.drawImage(img, 0, 0, vw, vh);

        // Try WebP first, fallback to JPEG if browser lacks WebP encoder
        let viewDataUrl = cv.toDataURL('image/webp', quality);
        const isWebp = viewDataUrl.startsWith('data:image/webp');
        if (!isWebp) {
          viewDataUrl = cv.toDataURL('image/jpeg', quality);
        }

        // Thumbnail 360px
        const scaleThumb = Math.min(1, 360 / Math.max(w, h));
        const tw = Math.max(1, Math.round(w * scaleThumb));
        const th = Math.max(1, Math.round(h * scaleThumb));
        const tcv = document.createElement('canvas');
        tcv.width = tw;
        tcv.height = th;
        tcv.getContext('2d')?.drawImage(img, 0, 0, tw, th);
        const thumbDataUrl = tcv.toDataURL(isWebp ? 'image/webp' : 'image/jpeg', 0.72);

        URL.revokeObjectURL(url);

        // Convert DataURL to Blob for size metrics & chunked upload
        const base64Part = viewDataUrl.split(',')[1] || '';
        const bin = atob(base64Part);
        const u8 = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        const blob = new Blob([u8], { type: isWebp ? 'image/webp' : 'image/jpeg' });

        const cleanBase = file.name.replace(/\.[^.]+$/, '');
        const fileName = `${cleanBase}.${isWebp ? 'webp' : 'jpg'}`;
        const savingsPercent =
          file.size > 0
            ? Math.max(0, Math.round(((file.size - blob.size) / file.size) * 100))
            : 0;

        resolve({
          fileName,
          originalBytes: file.size,
          compressedBytes: blob.size,
          savingsPercent,
          viewDataUrl,
          thumbDataUrl,
          blob,
        });
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Неуспешно декодиране на ${file.name}`));
    };
    img.src = url;
  });
}
