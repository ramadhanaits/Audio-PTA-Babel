/**
 * IndexedDB storage for storing audio files (MP3/WAV) locally on the operator's PC/device.
 * Storing Blobs in IndexedDB allows audio to persist across page reloads and browser sessions.
 */

const DB_NAME = 'PTA_Babel_Audio_DB';
const DB_VERSION = 1;
const STORE_NAME = 'audio_files';

interface StoredAudioRecord {
  scheduleId: string;
  blob: Blob;
  name: string;
  type: string;
  size: number;
  lastModified: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'scheduleId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an audio file blob associated with a schedule slot
 */
export async function saveAudioFile(scheduleId: string, file: File | Blob, fileName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record: StoredAudioRecord = {
      scheduleId,
      blob: file,
      name: fileName,
      type: file.type || 'audio/mpeg',
      size: file.size,
      lastModified: Date.now()
    };

    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieve an audio file blob for a schedule slot
 */
export async function getAudioFile(scheduleId: string): Promise<StoredAudioRecord | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(scheduleId);

    req.onsuccess = () => {
      resolve(req.result || null);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Delete an audio file for a schedule slot
 */
export async function deleteAudioFile(scheduleId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(scheduleId);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get list of all schedule IDs that have stored audio files
 */
export async function getAllStoredAudioKeys(): Promise<string[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAllKeys();

    req.onsuccess = () => {
      resolve((req.result as string[]) || []);
    };
    req.onerror = () => reject(req.error);
  });
}
