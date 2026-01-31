import { Platform } from 'react-native';

// Unified database interface
export interface DatabaseAdapter {
  runAsync: (sql: string, params?: any[]) => Promise<void>;
  getFirstAsync: <T = any>(sql: string, params?: any[]) => Promise<T | null>;
  getAllAsync: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
  execAsync: (sql: string) => Promise<void>;
}

// Wrap SQLite database to match our interface
export const wrapSQLiteDB = (sqliteDb: any): DatabaseAdapter => {
  return {
    runAsync: async (sql: string, params: any[] = []) => {
      await sqliteDb.runAsync(sql, params);
    },
    getFirstAsync: async <T = any>(sql: string, params: any[] = []): Promise<T | null> => {
      return (await sqliteDb.getFirstAsync(sql, params)) as T | null;
    },
    getAllAsync: async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
      return (await sqliteDb.getAllAsync(sql, params)) as T[];
    },
    execAsync: async (sql: string) => {
      await sqliteDb.execAsync(sql);
    },
  };
};

// Create IndexedDB adapter
export const createIndexedDBAdapter = (): Promise<DatabaseAdapter> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const DB_VERSION = 2;
    const DB_NAME = 'travelbuddy_db';
    const requiredStores = [
      'users', 'profiles', 'trips', 'buddies', 'trip_participants',
      'messages', 'itinerary_items', 'expenses', 'recommendations', 'journal_entries', 'chat_messages'
    ];

    // First, check if database exists and has all stores
    const checkRequest = indexedDB.open(DB_NAME);
    
    checkRequest.onsuccess = () => {
      const db = checkRequest.result;
      const existingStores = Array.from(db.objectStoreNames);
      const missingStores = requiredStores.filter(store => !existingStores.includes(store));
      
      db.close();
      
      if (missingStores.length > 0) {
        console.log('[DB] Missing stores, upgrading database:', missingStores);
        // Need to upgrade - close and reopen with higher version
        const upgradeRequest = indexedDB.open(DB_NAME, DB_VERSION);
        
        upgradeRequest.onupgradeneeded = (event) => {
          console.log('[DB] onupgradeneeded triggered');
          const upgradeDb = (event.target as IDBOpenDBRequest).result;
          requiredStores.forEach(storeName => {
            if (!upgradeDb.objectStoreNames.contains(storeName)) {
              console.log('[DB] Creating object store:', storeName);
              upgradeDb.createObjectStore(storeName, { keyPath: 'id' });
            }
          });
        };
        
        upgradeRequest.onsuccess = () => {
          const finalDb = upgradeRequest.result;
          resolve(createAdapter(finalDb));
        };
        
        upgradeRequest.onerror = () => reject(upgradeRequest.error);
      } else {
        // All stores exist, just open normally
        const openRequest = indexedDB.open(DB_NAME, DB_VERSION);
        openRequest.onsuccess = () => {
          resolve(createAdapter(openRequest.result));
        };
        openRequest.onerror = () => reject(openRequest.error);
        openRequest.onupgradeneeded = (event) => {
          // Handle upgrade if needed
          const upgradeDb = (event.target as IDBOpenDBRequest).result;
          requiredStores.forEach(storeName => {
            if (!upgradeDb.objectStoreNames.contains(storeName)) {
              upgradeDb.createObjectStore(storeName, { keyPath: 'id' });
            }
          });
        };
      }
    };
    
    checkRequest.onerror = () => reject(checkRequest.error);
  });
};

function createAdapter(db: IDBDatabase): DatabaseAdapter {
  console.log('[DB] Creating adapter, existing stores:', Array.from(db.objectStoreNames));
  return {
    runAsync: async (sql: string, params: any[] = []) => {
      console.log('[DB] runAsync:', sql.substring(0, 50));
      try {
        return await executeWrite(db, sql, params);
      } catch (error) {
        console.error('[DB] Error in runAsync:', error, sql);
        throw error;
      }
    },
    getFirstAsync: async <T = any>(sql: string, params: any[] = []): Promise<T | null> => {
      console.log('[DB] getFirstAsync:', sql.substring(0, 50));
      try {
        const results = await executeRead(db, sql, params);
        return (results[0] || null) as T | null;
      } catch (error) {
        console.error('[DB] Error in getFirstAsync:', error, sql);
        throw error;
      }
    },
    getAllAsync: async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
      console.log('[DB] getAllAsync:', sql.substring(0, 50));
      try {
        return await executeRead(db, sql, params) as T[];
      } catch (error) {
        console.error('[DB] Error in getAllAsync:', error, sql);
        throw error;
      }
    },
    execAsync: async (sql: string) => {
      console.log('[DB] execAsync:', sql.substring(0, 100));
      // For CREATE TABLE, object stores are already created in onupgradeneeded
      // Just return success
      return;
    },
  };
}

async function executeRead(db: IDBDatabase, sql: string, params: any[]): Promise<any[]> {
  const storeName = extractStoreName(sql);
  if (!storeName) return [];

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      let results = request.result || [];
      results = applyWhereFilter(results, sql, params);
      results = applyOrderBy(results, sql);
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

async function executeWrite(db: IDBDatabase, sql: string, params: any[]): Promise<void> {
  const sqlUpper = sql.toUpperCase();
  
  if (sqlUpper.includes('INSERT')) {
    return insertRecord(db, sql, params);
  } else if (sqlUpper.includes('UPDATE')) {
    return updateRecord(db, sql, params);
  } else if (sqlUpper.includes('DELETE')) {
    return deleteRecord(db, sql, params);
  }
}

function extractStoreName(sql: string): string | null {
  const match = sql.match(/FROM\s+(\w+)|INTO\s+(\w+)|UPDATE\s+(\w+)/i);
  return match?.[1] || match?.[2] || match?.[3] || null;
}

function applyWhereFilter(results: any[], sql: string, params: any[]): any[] {
  const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER|\s*$)/i);
  if (!whereMatch) return results;

  const condition = whereMatch[1];
  const parts = condition.split('AND').map(p => p.trim());

  return results.filter((row: any) => {
    return parts.every(part => {
      if (part.includes('=')) {
        const [field, value] = part.split('=').map(s => s.trim());
        const paramMatch = value.match(/\?/);
        if (paramMatch) {
          const paramIndex = params.findIndex((_, i) => value === `?`);
          const paramValue = paramIndex >= 0 ? params[paramIndex] : null;
          return row[field] === paramValue;
        }
        const cleanValue = value.replace(/'/g, '').replace(/"/g, '');
        return row[field] === cleanValue;
      }
      if (part.includes('!=')) {
        const [field, value] = part.split('!=').map(s => s.trim());
        const paramMatch = value.match(/\?/);
        if (paramMatch) {
          const paramValue = params[0] || null;
          return row[field] !== paramValue;
        }
        return row[field] !== value;
      }
      return true;
    });
  });
}

function applyOrderBy(results: any[], sql: string): any[] {
  const orderMatch = sql.match(/ORDER BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
  if (!orderMatch) return results;

  const field = orderMatch[1];
  const direction = orderMatch[2]?.toUpperCase() || 'ASC';

  return [...results].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    if (direction === 'DESC') {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    }
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
  });
}

async function insertRecord(db: IDBDatabase, sql: string, params: any[]): Promise<void> {
  const storeName = extractStoreName(sql);
  if (!storeName) return;

  const fieldsMatch = sql.match(/\(([^)]+)\)\s+VALUES/i);
  const valuesMatch = sql.match(/VALUES\s*\(([^)]+)\)/i);
  
  if (!fieldsMatch || !valuesMatch) return;

  const fields = fieldsMatch[1].split(',').map(f => f.trim());
  const values = valuesMatch[1].split(',').map((v, i) => {
    const trimmed = v.trim();
    if (trimmed === '?') return params[i] !== undefined ? params[i] : null;
    if (trimmed.includes("datetime('now')")) return new Date().toISOString();
    if (trimmed.includes("NOW()")) return new Date().toISOString();
    return trimmed.replace(/^'|'$/g, '').replace(/^"|"$/g, '');
  });

  const obj: any = {};
  fields.forEach((field, i) => {
    obj[field] = values[i];
  });

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(obj);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function updateRecord(db: IDBDatabase, sql: string, params: any[]): Promise<void> {
  console.log('[DB] updateRecord called with sql:', sql, 'params:', params);
  const storeName = extractStoreName(sql);
  if (!storeName) {
    console.error('[DB] Could not extract store name from:', sql);
    return;
  }

  // Extract SET clause - match everything between SET and WHERE
  const setMatch = sql.match(/SET\s+(.+?)(?:\s+WHERE|\s*$)/i);
  const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s*$)/i);
  
  if (!setMatch) {
    console.error('[DB] Could not parse SET clause from:', sql);
    return;
  }

  const updates: any = {};
  let paramIndex = 0;
  
  // Parse SET clause - split by comma but handle nested commas in datetime()
  const setClause = setMatch[1];
  // Split by comma, but be careful with datetime('now')
  const parts = setClause.split(',').map(p => p.trim());
  
  parts.forEach(part => {
    const equalIndex = part.indexOf('=');
    if (equalIndex === -1) return;
    
    const field = part.substring(0, equalIndex).trim();
    const value = part.substring(equalIndex + 1).trim();
    
    if (value === '?') {
      // Use the current param index (WHERE param is last, so we don't count it here)
      if (paramIndex < params.length - 1) {
        updates[field] = params[paramIndex] !== undefined ? params[paramIndex] : null;
        paramIndex++;
      } else {
        console.warn('[DB] Param index out of bounds for field:', field);
      }
    } else if (value.includes("datetime('now')") || value.includes("NOW()")) {
      updates[field] = new Date().toISOString();
    } else {
      updates[field] = value.replace(/^'|'$/g, '').replace(/^"|"$/g, '');
    }
  });
  
  console.log('[DB] Parsed updates:', updates, 'paramIndex:', paramIndex, 'total params:', params.length);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const getAllRequest = store.getAll();
    let itemsToUpdate: any[] = [];

    getAllRequest.onsuccess = () => {
      const items = getAllRequest.result;
      console.log('[DB] Found', items.length, 'items to check for update');

      items.forEach((item: any) => {
        let shouldUpdate = true;
        
        if (whereMatch) {
          const whereCondition = whereMatch[1];
          const whereParts = whereCondition.split('=').map(s => s.trim());
          if (whereParts.length === 2) {
            const whereField = whereParts[0];
            const whereValue = whereParts[1];
            // The WHERE param is the last one in the params array (after all SET params)
            const whereParam = whereValue === '?' ? params[params.length - 1] : whereValue.replace(/^'|'$/g, '').replace(/^"|"$/g, '');
            console.log('[DB] WHERE check - field:', whereField, 'expected:', whereParam, 'actual:', item[whereField]);
            shouldUpdate = String(item[whereField]) === String(whereParam);
          }
        }

        if (shouldUpdate) {
          console.log('[DB] Item matches, will update:', item.id);
          // Create a new object with updates applied
          const updatedItem = { ...item };
          Object.keys(updates).forEach(key => {
            updatedItem[key] = updates[key];
            console.log('[DB] Setting', key, 'to', updates[key]);
          });
          itemsToUpdate.push(updatedItem);
        }
      });

      if (itemsToUpdate.length === 0) {
        console.log('[DB] No items matched WHERE condition');
        resolve();
        return;
      }

      console.log('[DB] Updating', itemsToUpdate.length, 'item(s)');
      // Put all items that need updating
      itemsToUpdate.forEach((updatedItem, index) => {
        const putRequest = store.put(updatedItem);
        putRequest.onsuccess = () => {
          console.log('[DB] Item', updatedItem.id, 'updated successfully (', index + 1, '/', itemsToUpdate.length, ')');
        };
        putRequest.onerror = () => {
          console.error('[DB] Error putting item:', putRequest.error);
        };
      });

      transaction.oncomplete = () => {
        console.log('[DB] Transaction complete, all updates applied');
        resolve();
      };
      transaction.onerror = () => {
        console.error('[DB] Transaction error:', transaction.error);
        reject(transaction.error);
      };
    };
    getAllRequest.onerror = () => {
      console.error('[DB] Error getting items:', getAllRequest.error);
      reject(getAllRequest.error);
    };
  });
}

async function deleteRecord(db: IDBDatabase, sql: string, params: any[]): Promise<void> {
  const storeName = extractStoreName(sql);
  if (!storeName) return;

  const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s*$)/i);
  if (!whereMatch) return;

  const [whereField, whereValue] = whereMatch[1].split('=').map(s => s.trim());
  const whereParam = whereValue === '?' ? params[0] : whereValue.replace(/^'|'$/g, '').replace(/^"|"$/g, '');

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      const items = getAllRequest.result;
      items.forEach((item: any) => {
        if (item[whereField] === whereParam) {
          store.delete(item.id);
        }
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
    getAllRequest.onerror = () => reject(getAllRequest.error);
  });
}
