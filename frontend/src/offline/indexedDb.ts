const DB_NAME = 'gleason-platform';
const DB_VERSION = 1;
const STORE = 'key-value';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function setLocalValue<T>(key: string, value: T): Promise<void> {
  await updateLocalValue<T>(key, () => value);
}

/** Atomic read/modify/write, including concurrent tabs writing different packs. */
export async function updateLocalValue<T>(key: string, update: (current: T | undefined) => T): Promise<void> {
  const db = await openDatabase();
  try { await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const request = store.get(key);
    request.onsuccess = () => {
      try { store.put(update(request.result as T | undefined), key); }
      catch (error) { tx.abort(); reject(error); }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB write aborted'));
  }); } finally { db.close(); }
}

export async function getLocalValue<T>(key: string): Promise<T | undefined> {
  const db = await openDatabase();
  try { return await new Promise<T | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  }); } finally { db.close(); }
}
