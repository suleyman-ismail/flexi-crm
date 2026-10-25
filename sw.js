// Flexi CRM v5.1.0 – Service Worker (Network-first for HTML, Stale-while-revalidate for assets)
const CACHE = 'flexi-crm-v510';
const SHELL = ['./', 'index.html', 'f.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' }))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks =>
      Promise.all(ks.filter(k => k !== CACHE && k.indexOf('flexi-crm-') === 0).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;

  // Network-first for HTML navigation so updates appear immediately
  if (e.request.mode === 'navigate' || u.pathname.endsWith('.html') || u.pathname.endsWith('/')) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          if (r && r.ok) {
            const copy = r.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
          }
          return r;
        })
        .catch(() => caches.open(CACHE).then(c => c.match(e.request, { ignoreSearch: true })))
    );
    return;
  }

  e.respondWith(
    caches.open(CACHE).then(c =>
      c.match(e.request, { ignoreSearch: true }).then(hit => {
        const net = fetch(e.request)
          .then(r => {
            if (r && r.ok) c.put(e.request, r.clone());
            return r;
          })
          .catch(() => hit);
        return hit || net;
      })
    )
  );
});

const API = 'https://script.google.com/macros/s/AKfycbwsUVFw9bRxnsx_NDtJfZDOlU8iE6Br91SEhCP7z4Jn-Y223ytToFbdM00Rb2DXMLn55w/exec';
function tok() {
  return new Promise(res => {
    try {
      const q = indexedDB.open('flexi-crm', 1);
      q.onupgradeneeded = () => {
        const db = q.result;
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
        if (!db.objectStoreNames.contains('q')) db.createObjectStore('q', { autoIncrement: true });
      };
      q.onsuccess = () => {
        try {
          const g = q.result.transaction('kv', 'readonly').objectStore('kv').get('token');
          g.onsuccess = () => res(g.result || '');
          g.onerror = () => res('');
        } catch (e) {
          res('');
        }
      };
      q.onerror = () => res('');
    } catch (e) {
      res('');
    }
  });
}

self.addEventListener('push', e => {
  e.waitUntil((async () => {
    let items = [];
    try {
      const t = await tok(), s = await self.registration.pushManager.getSubscription();
      if (t) {
        const r = await fetch(API, { method: 'POST', body: JSON.stringify({ fn: 'getNotif', args: [s ? s.endpoint : ''], token: t }) });
        const j = await r.json();
        if (j && j.ok && Array.isArray(j.data)) items = j.data;
      }
    } catch (x) {}
    const o = { icon: 'icon-192.png', badge: 'icon-192.png' };
    if (!items.length) return self.registration.showNotification('Flexi CRM', Object.assign({ body: 'Има промяна в задачите ти – отвори приложението', tag: 'crm' }, o));
    for (const n of items) await self.registration.showNotification(n.ti || 'Flexi CRM', Object.assign({ body: n.b || '', tag: n.i || 'crm', data: { c: n.c || '', w: n.w || '' } }, o));
  })());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const d = e.notification.data || {}, sc = self.registration.scope;
  const url = sc + (d.c || d.w ? '?' + (d.w ? 'ws=r&' : '') + (d.c ? 'c=' + encodeURIComponent(d.c) : '') : '');
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) { if (c.url.indexOf(sc) === 0 && 'focus' in c) { c.postMessage({ crmOpen: d }); return c.focus(); } }
    return clients.openWindow(url);
  }));
});
