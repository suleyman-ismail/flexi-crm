import { create } from 'zustand';
import {
  AppData,
  ClientCard,
  NavTab,
  ToastItem,
  WorkspaceId,
  TaskItem,
} from '../types/crm';
import {
  gasApiCall,
  idbGet,
  idbSet,
  queueFlushAll,
  queueGetCount,
  newRequestId,
} from '../api/client';
import { DEMO_APP_DATA_FLEXI, DEMO_APP_DATA_RENO } from '../api/mockData';

export type SyncState = 'synced' | 'syncing' | 'offline';

interface CrmState {
  token: string;
  ws: WorkspaceId;
  theme: 'light' | 'dark';
  activeTab: NavTab;
  sidebarCollapsed: boolean;
  scopeFilter: 'mine' | 'all';
  clientsViewMode: 'split' | 'kanban';
  sitesViewMode: 'split' | 'map';
  selectedClientName: string | null;
  selectedSiteName: string | null;
  mobileSheetClient: string | null;
  cmdOpen: boolean;
  newModalOpen: 'task' | 'client' | null;

  appData: AppData | null;
  isLoadingApp: boolean;
  clientCardsCache: Record<string, ClientCard>;
  loadingCardName: string | null;

  syncState: SyncState;
  pendingMutations: number;
  lastLatencyMs: number | null;
  toasts: ToastItem[];

  // Actions
  initApp: () => Promise<void>;
  loginWithPin: (pin: string) => Promise<void>;
  loginDemoMode: () => Promise<void>;
  logout: () => void;
  setWorkspace: (ws: WorkspaceId) => Promise<void>;
  toggleTheme: () => void;
  setActiveTab: (tab: NavTab) => void;
  toggleSidebar: () => void;
  setScopeFilter: (scope: 'mine' | 'all') => void;
  setClientsViewMode: (mode: 'split' | 'kanban') => void;
  setSitesViewMode: (mode: 'split' | 'map') => void;
  selectClient: (name: string | null, openMobileSheet?: boolean) => Promise<void>;
  selectSite: (name: string | null, openMobileSheet?: boolean) => Promise<void>;
  closeMobileSheet: () => void;
  setCmdOpen: (open: boolean) => void;
  setNewModalOpen: (modal: 'task' | 'client' | null) => void;

  // Toast Actions
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Optimistic Mutations
  refreshAppData: (silent?: boolean) => Promise<void>;
  completeTaskOptimistic: (task: TaskItem) => Promise<void>;
  snoozeTaskOptimistic: (task: TaskItem, days: number) => Promise<void>;
  moveClientStageOptimistic: (clientName: string, newStage: string) => Promise<void>;
  createTaskOptimistic: (payload: {
    client: string;
    type: string;
    date: string;
    time: string;
    remind: string;
    desc: string;
    rep: string;
  }) => Promise<void>;
  createClientOptimistic: (payload: {
    name: string;
    phone: string;
    city: string;
    model: string;
    budget: number;
    src: string;
    stage: string;
    rep: string;
    notes: string;
    site: boolean;
  }) => Promise<void>;
  updateClientCoordinatesOptimistic: (
    clientName: string,
    lat: number,
    lng: number
  ) => Promise<void>;
  updateClientCardCache: (clientName: string, updater: (card: ClientCard) => ClientCard) => void;
}

function addDaysIso(isoDate: string, days: number): string {
  const parts = String(isoDate || new Date().toISOString().slice(0, 10)).split('-');
  const dt = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2] + days));
  return dt.toISOString().slice(0, 10);
}

export const useCrmStore = create<CrmState>((set, get) => ({
  token: localStorage.getItem('crm_tok') || '',
  ws: (localStorage.getItem('crm_ws') as WorkspaceId) || '',
  theme:
    (localStorage.getItem('crm_theme_v5') as 'light' | 'dark') ||
    (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  activeTab: 'tasks',
  sidebarCollapsed: false,
  scopeFilter: 'all',
  clientsViewMode: 'split',
  sitesViewMode: 'split',
  selectedClientName: null,
  selectedSiteName: null,
  mobileSheetClient: null,
  cmdOpen: false,
  newModalOpen: null,

  appData: null,
  isLoadingApp: false,
  clientCardsCache: {},
  loadingCardName: null,

  syncState: navigator.onLine ? 'synced' : 'offline',
  pendingMutations: 0,
  lastLatencyMs: null,
  toasts: [],

  initApp: async () => {
    const { theme, ws } = get();
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('ws-reno', ws === 'r');

    // Check IndexedDB token if localStorage is empty
    let tok = get().token;
    if (!tok) {
      const idbTok = await idbGet<string>('token');
      if (idbTok) {
        tok = idbTok;
        localStorage.setItem('crm_tok', tok);
        set({ token: tok });
      }
    }

    const qCount = await queueGetCount();
    set({ pendingMutations: qCount });

    // Load cached AppData from localStorage immediately for instant 0ms boot
    const cacheKey = `crm_d2${ws ? '_' + ws : ''}`;
    const rawCached = localStorage.getItem(cacheKey);
    if (rawCached) {
      try {
        const parsed = JSON.parse(rawCached) as AppData;
        if (parsed && parsed.clients) {
          set({
            appData: parsed,
            selectedClientName: parsed.clients[0]?.n || null,
            selectedSiteName: parsed.clients.find((c) => c.x)?.n || null,
          });
        }
      } catch {
        // ignore invalid cache
      }
    }

    if (tok) {
      await get().refreshAppData(!!rawCached);
    }
  },

  loginWithPin: async (pin: string) => {
    set({ isLoadingApp: true, syncState: 'syncing' });
    try {
      const res = await gasApiCall<{ token: string; d?: AppData }>('login', [pin], {
        token: '',
        ws: get().ws,
        onLatency: (ms) => set({ lastLatencyMs: ms }),
      });
      if (!res?.token) throw new Error('Невалиден PIN код');
      localStorage.setItem('crm_tok', res.token);
      await idbSet('token', res.token);
      set({ token: res.token, syncState: 'synced' });

      if (res.d && res.d.clients) {
        const ws = get().ws;
        localStorage.setItem(`crm_d2${ws ? '_' + ws : ''}`, JSON.stringify(res.d));
        set({
          appData: res.d,
          isLoadingApp: false,
          selectedClientName: res.d.clients[0]?.n || null,
          selectedSiteName: res.d.clients.find((c) => c.x)?.n || null,
        });
      } else {
        await get().refreshAppData();
      }
      get().addToast({
        title: 'Успешен вход',
        description: `Добре дошли в CRM Flexi Home`,
        variant: 'success',
      });
    } catch (err: unknown) {
      set({ isLoadingApp: false, syncState: navigator.onLine ? 'synced' : 'offline' });
      throw err;
    }
  },

  loginDemoMode: async () => {
    const ws = get().ws;
    const demoData = ws === 'r' ? DEMO_APP_DATA_RENO : DEMO_APP_DATA_FLEXI;
    localStorage.setItem('crm_tok', 'DEMO_TOKEN');
    set({
      token: 'DEMO_TOKEN',
      appData: demoData,
      isLoadingApp: false,
      syncState: 'synced',
      lastLatencyMs: 42,
      selectedClientName: demoData.clients[0]?.n || null,
      selectedSiteName: demoData.clients.find((c) => c.x)?.n || null,
    });
    if (demoData.clients[0]) {
      await get().selectClient(demoData.clients[0].n, false);
    }
    get().addToast({
      title: 'Демо режим активиран',
      description: 'Всички функции (Kanban, Преди/След, WebP, Графики) са активни.',
      variant: 'success',
    });
  },

  logout: () => {
    localStorage.removeItem('crm_tok');
    idbSet('token', null);
    set({
      token: '',
      appData: null,
      clientCardsCache: {},
      selectedClientName: null,
      selectedSiteName: null,
    });
  },

  setWorkspace: async (ws: WorkspaceId) => {
    localStorage.setItem('crm_ws', ws);
    document.body.classList.toggle('ws-reno', ws === 'r');
    set({
      ws,
      selectedClientName: null,
      selectedSiteName: null,
      mobileSheetClient: null,
    });
    await get().refreshAppData();
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('crm_theme_v5', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    set({ theme: next });
  },

  setActiveTab: (tab: NavTab) => set({ activeTab: tab }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setScopeFilter: (scope) => set({ scopeFilter: scope }),
  setClientsViewMode: (mode) => set({ clientsViewMode: mode }),
  setSitesViewMode: (mode) => set({ sitesViewMode: mode }),
  closeMobileSheet: () => set({ mobileSheetClient: null }),
  setCmdOpen: (open) => set({ cmdOpen: open }),
  setNewModalOpen: (modal) => set({ newModalOpen: modal }),

  addToast: (toast) => {
    const id = newRequestId();
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...toast, id }] }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 5500);
  },

  dismissToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  refreshAppData: async (silent = false) => {
    const { token, ws } = get();
    if (!token) return;
    if (!silent) set({ isLoadingApp: true });
    set({ syncState: navigator.onLine ? 'syncing' : 'offline' });

    try {
      const data = await gasApiCall<AppData>('getAppData', [], {
        token,
        ws,
        onLatency: (ms) => set({ lastLatencyMs: ms }),
      });
      if (data && data.clients) {
        const cacheKey = `crm_d2${ws ? '_' + ws : ''}`;
        localStorage.setItem(cacheKey, JSON.stringify(data));
        const curClient = get().selectedClientName;
        const curSite = get().selectedSiteName;
        const nextClient =
          curClient && data.clients.some((c) => c.n === curClient)
            ? curClient
            : data.clients[0]?.n || null;
        const nextSite =
          curSite && data.clients.some((c) => c.n === curSite && c.x)
            ? curSite
            : data.clients.find((c) => c.x)?.n || null;

        set({
          appData: data,
          isLoadingApp: false,
          syncState: 'synced',
          selectedClientName: nextClient,
          selectedSiteName: nextSite,
        });

        if (nextClient && !get().clientCardsCache[nextClient.toLowerCase()]) {
          get().selectClient(nextClient, false);
        }
      } else {
        set({ isLoadingApp: false, syncState: 'synced' });
      }
      if (navigator.onLine && token !== 'DEMO_TOKEN') {
        await queueFlushAll(token, (rem) => set({ pendingMutations: rem }));
      }
    } catch (err: unknown) {
      const isAuth = err instanceof Error && err.message === 'AUTH';
      if (isAuth) {
        get().logout();
        return;
      }
      set({
        isLoadingApp: false,
        syncState: navigator.onLine ? 'synced' : 'offline',
      });
    }
  },

  selectClient: async (name, openMobileSheet = false) => {
    if (!name) {
      set({ selectedClientName: null, mobileSheetClient: null });
      return;
    }
    set({
      selectedClientName: name,
      ...(openMobileSheet ? { mobileSheetClient: name } : {}),
    });

    const key = name.toLowerCase();
    const existing = get().clientCardsCache[key];
    if (!existing) set({ loadingCardName: name });

    try {
      const card = await gasApiCall<ClientCard>('getClient', [name, true], {
        token: get().token,
        ws: get().ws,
        onLatency: (ms) => set({ lastLatencyMs: ms }),
      });
      if (card && card.name) {
        set((s) => ({
          loadingCardName: s.loadingCardName === name ? null : s.loadingCardName,
          clientCardsCache: {
            ...s.clientCardsCache,
            [key]: card,
          },
        }));
      } else {
        set({ loadingCardName: null });
      }
    } catch {
      set({ loadingCardName: null });
    }
  },

  selectSite: async (name, openMobileSheet = false) => {
    if (!name) {
      set({ selectedSiteName: null });
      return;
    }
    set({ selectedSiteName: name });
    await get().selectClient(name, openMobileSheet);
  },

  completeTaskOptimistic: async (task: TaskItem) => {
    const prevData = get().appData;
    if (!prevData) return;

    // Optimistically remove task from active list
    const nextTasks = prevData.tasks.filter(
      (t) => !((task.id && t.id === task.id) || t.row === task.row)
    );
    const updatedData: AppData = { ...prevData, tasks: nextTasks };
    set({ appData: updatedData, syncState: 'syncing' });

    let undone = false;
    get().addToast({
      title: `Задачата е завършена`,
      description: `${task.client} · ${task.type}`,
      variant: 'success',
      undoLabel: 'Върни',
      onUndo: () => {
        undone = true;
        set({ appData: prevData, syncState: 'synced' });
      },
    });

    setTimeout(async () => {
      if (undone) return;
      try {
        await gasApiCall(
          'doneTask',
          [
            {
              row: task.row,
              id: task.id || '',
              client: task.client,
              note: '',
              nextType: '',
            },
          ],
          { token: get().token, ws: get().ws, rid: newRequestId() }
        );
        set({ syncState: 'synced' });
      } catch {
        const cnt = await queueGetCount();
        set({ syncState: navigator.onLine ? 'synced' : 'offline', pendingMutations: cnt });
      }
    }, 2200);
  },

  snoozeTaskOptimistic: async (task: TaskItem, days: number) => {
    const prevData = get().appData;
    if (!prevData) return;
    const baseDate = task.date > prevData.today ? task.date : prevData.today;
    const newDate = addDaysIso(baseDate, days);

    const nextTasks = prevData.tasks.map((t) =>
      (task.id && t.id === task.id) || t.row === task.row ? { ...t, date: newDate } : t
    );
    set({ appData: { ...prevData, tasks: nextTasks }, syncState: 'syncing' });

    let undone = false;
    get().addToast({
      title: `Задачата е отложена (+${days}д)`,
      description: `${task.client} → ${newDate}`,
      variant: 'default',
      undoLabel: 'Върни',
      onUndo: () => {
        undone = true;
        set({ appData: prevData, syncState: 'synced' });
      },
    });

    setTimeout(async () => {
      if (undone) return;
      try {
        await gasApiCall('snoozeTask', [task.row, task.client, days, task.id || ''], {
          token: get().token,
          ws: get().ws,
          rid: newRequestId(),
        });
        set({ syncState: 'synced' });
      } catch {
        const cnt = await queueGetCount();
        set({ syncState: navigator.onLine ? 'synced' : 'offline', pendingMutations: cnt });
      }
    }, 2000);
  },

  moveClientStageOptimistic: async (clientName: string, newStage: string) => {
    const prevData = get().appData;
    if (!prevData) return;
    const target = prevData.clients.find((c) => c.n === clientName);
    if (!target || target.s === newStage) return;
    const oldStage = target.s;

    const nextClients = prevData.clients.map((c) => {
      if (c.n !== clientName) return c;
      const shouldBeSite =
        newStage === 'Сключен договор' || (get().ws === 'r' && newStage === 'В процес');
      return {
        ...c,
        s: newStage,
        x: shouldBeSite
          ? c.x || {
              o: '🔨 Тече',
              w: [],
              s0: prevData.today,
              deal: c.b || 0,
              got: 0,
              cost: 0,
              owed: 0,
            }
          : c.x,
      };
    });

    set((s) => {
      const key = clientName.toLowerCase();
      const cachedCard = s.clientCardsCache[key];
      return {
        appData: { ...prevData, clients: nextClients },
        syncState: 'syncing',
        clientCardsCache: cachedCard
          ? { ...s.clientCardsCache, [key]: { ...cachedCard, stage: newStage } }
          : s.clientCardsCache,
      };
    });

    let undone = false;
    get().addToast({
      title: `${clientName}`,
      description: `Етап: ${oldStage} → ${newStage}`,
      variant: 'success',
      undoLabel: 'Върни',
      onUndo: () => {
        undone = true;
        set({ appData: prevData, syncState: 'synced' });
      },
    });

    setTimeout(async () => {
      if (undone) return;
      try {
        await gasApiCall('setStage', [clientName, newStage, null], {
          token: get().token,
          ws: get().ws,
          rid: newRequestId(),
        });
        set({ syncState: 'synced' });
      } catch {
        const cnt = await queueGetCount();
        set({ syncState: navigator.onLine ? 'synced' : 'offline', pendingMutations: cnt });
      }
    }, 1800);
  },

  createTaskOptimistic: async (payload) => {
    const prevData = get().appData;
    if (!prevData) return;
    const newTask: TaskItem = {
      id: 'tmp-' + Date.now(),
      row: -Date.now(),
      client: payload.client,
      type: payload.type,
      date: payload.date,
      time: payload.time,
      remind: payload.remind,
      desc: payload.desc,
      rep: payload.rep || prevData.me,
      status: 'Планирана',
      tmp: true,
    };

    set({
      appData: { ...prevData, tasks: [newTask, ...prevData.tasks] },
      newModalOpen: null,
      syncState: 'syncing',
    });

    get().addToast({
      title: 'Нова задача е добавена',
      description: `${payload.client} · ${payload.type} (${payload.date})`,
      variant: 'success',
    });

    try {
      await gasApiCall('addTask', [payload], {
        token: get().token,
        ws: get().ws,
        rid: newRequestId(),
      });
      set({ syncState: 'synced' });
    } catch {
      const cnt = await queueGetCount();
      set({ syncState: navigator.onLine ? 'synced' : 'offline', pendingMutations: cnt });
    }
  },

  createClientOptimistic: async (payload) => {
    const prevData = get().appData;
    if (!prevData) return;
    const newClient = {
      n: payload.name,
      p: payload.phone,
      c: payload.city,
      s: payload.stage,
      r: payload.rep || prevData.me,
      m: payload.model,
      b: Number(payload.budget) || 0,
      i: prevData.today,
      l: prevData.today,
      nx: '',
      x:
        payload.site || payload.stage === 'Сключен договор'
          ? {
              o: '🔨 Тече',
              w: [],
              s0: prevData.today,
              deal: Number(payload.budget) || 0,
              got: 0,
              cost: 0,
              owed: 0,
            }
          : null,
    };

    set({
      appData: { ...prevData, clients: [newClient, ...prevData.clients] },
      selectedClientName: payload.name,
      newModalOpen: null,
      syncState: 'syncing',
    });

    get().addToast({
      title: 'Клиентът е създаден',
      description: `${payload.name} (${payload.city || '—'})`,
      variant: 'success',
    });

    try {
      await gasApiCall('addClient', [payload], {
        token: get().token,
        ws: get().ws,
        rid: newRequestId(),
      });
      set({ syncState: 'synced' });
    } catch {
      const cnt = await queueGetCount();
      set({ syncState: navigator.onLine ? 'synced' : 'offline', pendingMutations: cnt });
    }
  },

  updateClientCoordinatesOptimistic: async (clientName, lat, lng) => {
    const prevData = get().appData;
    if (!prevData) return;
    const mapsUrl = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
    const nextClients = prevData.clients.map((c) =>
      c.n === clientName ? { ...c, maps: mapsUrl } : c
    );
    set((s) => {
      const key = clientName.toLowerCase();
      const card = s.clientCardsCache[key];
      return {
        appData: { ...prevData, clients: nextClients },
        syncState: 'syncing',
        clientCardsCache: card
          ? { ...s.clientCardsCache, [key]: { ...card, maps: mapsUrl } }
          : s.clientCardsCache,
      };
    });

    get().addToast({
      title: 'GPS локацията е обновена',
      description: `${clientName} → ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      variant: 'success',
    });

    try {
      await gasApiCall('saveLocation', [clientName, lat, lng], {
        token: get().token,
        ws: get().ws,
        rid: newRequestId(),
      });
      set({ syncState: 'synced' });
    } catch {
      const cnt = await queueGetCount();
      set({ syncState: navigator.onLine ? 'synced' : 'offline', pendingMutations: cnt });
    }
  },

  updateClientCardCache: (clientName, updater) => {
    const key = clientName.toLowerCase();
    set((s) => {
      const cur = s.clientCardsCache[key];
      if (!cur) return s;
      const updated = updater(cur);
      if (s.token === 'DEMO_TOKEN') {
        localStorage.setItem(`demo_card_${s.ws || 'm'}_${key}`, JSON.stringify(updated));
      }
      return {
        clientCardsCache: {
          ...s.clientCardsCache,
          [key]: updated,
        },
      };
    });
  },
}));
