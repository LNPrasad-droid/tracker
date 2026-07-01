const CACHE_NAME = 'leo-os-shell-v2';
const API_STATE_PATH = '/api/state';
const OFFLINE_URL = '/offline.html';
const SHELL_ASSETS = ['/', '/index.html', OFFLINE_URL, '/manifest.json', '/icons/icon.svg'];
const DB_NAME = 'leo-os-sync';
const STORE_NAME = 'pending-state';

const openSyncDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const pendingIdForUser = (user) => `latest:${(user || 'unknown').toLowerCase()}`;

const savePendingState = async (user, password, payload) => {
  const db = await openSyncDb();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put({ id: pendingIdForUser(user), user, password, payload, createdAt: Date.now() });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
};

const readAllPendingStates = async () => {
  const db = await openSyncDb();
  const value = await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return value;
};

const clearPendingState = async (id) => {
  const db = await openSyncDb();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
};

const flushPendingState = async () => {
  const pendingStates = await readAllPendingStates();
  if (!pendingStates?.length) return;

  for (const pending of pendingStates) {
    const response = await fetch(API_STATE_PATH, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Leo-User': pending.user,
        'X-Leo-Password': pending.password,
      },
      body: pending.payload,
    });

    if (response.ok) {
      await clearPendingState(pending.id);
    }
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (event.request.method === 'PUT' && requestUrl.pathname === API_STATE_PATH) {
    event.respondWith(
      fetch(event.request.clone()).catch(async () => {
        const payload = await event.request.clone().text();
        const user = event.request.headers.get('X-Leo-User');
        const password = event.request.headers.get('X-Leo-Password');
        await savePendingState(user, password, payload);
        const parsedPayload = JSON.parse(payload);
        if ('sync' in self.registration) {
          await self.registration.sync.register('sync-leo-state');
        }
        return new Response(JSON.stringify({ queued: true, state: parsedPayload.state }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  if (event.request.method === 'GET' && requestUrl.pathname === API_STATE_PATH) {
    event.respondWith(
      fetch(event.request)
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html').then((response) => response || caches.match(OFFLINE_URL)))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && event.request.method === 'GET' && requestUrl.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-leo-state') {
    event.waitUntil(flushPendingState());
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
