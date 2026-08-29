const DATABASE_NAME = 'framed2'
const STORE_NAME = 'storage'

let databasePromise: Promise<IDBDatabase> | null = null

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1)

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => {
      const database = request.result
      database.onversionchange = () => {
        database.close()
        databasePromise = null
      }
      resolve(database)
    }
    request.onerror = () => reject(request.error)
  })
}

function getDatabase(): Promise<IDBDatabase> {
  if (!databasePromise) {
    const opening = openDatabase()
    databasePromise = opening
    void opening.catch(() => {
      if (databasePromise === opening) databasePromise = null
    })
  }

  return databasePromise
}

function executeRequest<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return getDatabase().then(
    (database) =>
      new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode)
        let result: T

        transaction.oncomplete = () => resolve(result)
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error)

        try {
          const request = operation(transaction.objectStore(STORE_NAME))
          request.onsuccess = () => {
            result = request.result
          }
          request.onerror = () => reject(request.error)
        } catch (error) {
          transaction.abort()
          reject(error)
        }
      }),
  )
}

export async function idbGet<T>(key: string): Promise<T | undefined> {
  return executeRequest<T | undefined>('readonly', (store) => store.get(key))
}

export async function idbSet(key: string, value: unknown): Promise<void> {
  await executeRequest<IDBValidKey>('readwrite', (store) => store.put(value, key))
}

export async function idbDel(key: string): Promise<void> {
  await executeRequest<undefined>('readwrite', (store) => store.delete(key))
}

export async function idbClear(): Promise<void> {
  await executeRequest<undefined>('readwrite', (store) => store.clear())
}

export async function idbKeys(): Promise<string[]> {
  const keys = await executeRequest<IDBValidKey[]>('readonly', (store) => store.getAllKeys())
  return keys.filter((key): key is string => typeof key === 'string')
}
