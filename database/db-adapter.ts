import { Platform } from 'react-native';
export interface DatabaseAdapter {
  runAsync: (sql: string, params?: any[]) => Promise<void>;
  getFirstAsync: <T = any>(sql: string, params?: any[]) => Promise<T | null>;
  getAllAsync: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
  execAsync: (sql: string) => Promise<void>;
}
export const wrapSQLiteDB = (sqliteDb: any): DatabaseAdapter => {
  return {
    runAsync: async (sql: string, params: any[] = []) => {
      try {
        const safeParams = (params || []).filter(p => p !== undefined);
        await sqliteDb.runAsync(sql, safeParams.length > 0 ? safeParams : []);
      } catch (error) {
        throw error;
      }
    },
    getFirstAsync: async <T = any>(sql: string, params: any[] = []): Promise<T | null> => {
      try {
        const safeParams = (params || []).filter(p => p !== undefined);
        return (await sqliteDb.getFirstAsync(sql, safeParams.length > 0 ? safeParams : [])) as T | null;
      } catch (error) {
        throw error;
      }
    },
    getAllAsync: async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
      try {
        const safeParams = (params || []).filter(p => p !== undefined);
        return (await sqliteDb.getAllAsync(sql, safeParams.length > 0 ? safeParams : [])) as T[];
      } catch (error) {
        throw error;
      }
    },
    execAsync: async (sql: string) => {
      try {
        await sqliteDb.execAsync(sql);
      } catch (error) {
        throw error;
      }
    },
  };
};
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
    const checkRequest = indexedDB.open(DB_NAME);
    checkRequest.onsuccess = () => {
      const db = checkRequest.result;
      const existingStores = Array.from(db.objectStoreNames);
      const missingStores = requiredStores.filter(store => !existingStores.includes(store));
      db.close();
      if (missingStores.length > 0) {
        const upgradeRequest = indexedDB.open(DB_NAME, DB_VERSION);
        upgradeRequest.onupgradeneeded = (event) => {
          const upgradeDb = (event.target as IDBOpenDBRequest).result;
          requiredStores.forEach(storeName => {
            if (!upgradeDb.objectStoreNames.contains(storeName)) {
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
        const openRequest = indexedDB.open(DB_NAME, DB_VERSION);
        openRequest.onsuccess = () => {
          resolve(createAdapter(openRequest.result));
        };
        openRequest.onerror = () => reject(openRequest.error);
        openRequest.onupgradeneeded = (event) => {
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
  return {
    runAsync: async (sql: string, params: any[] = []) => {
      try {
        return await executeWrite(db, sql, params);
      } catch (error) {
        throw error;
      }
    },
    getFirstAsync: async <T = any>(sql: string, params: any[] = []): Promise<T | null> => {
      try {
        const results = await executeRead(db, sql, params);
        return (results[0] || null) as T | null;
      } catch (error) {
        throw error;
      }
    },
    getAllAsync: async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
      try {
        return await executeRead(db, sql, params) as T[];
      } catch (error) {
        throw error;
      }
    },
    execAsync: async (sql: string) => {
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
  return results.filter((row: any) => {
    return evaluateWhereCondition(row, condition, params);
  });
}
function evaluateWhereCondition(row: any, condition: string, params: any[]): boolean {
  const orParts: string[] = [];
  let current = '';
  let parenDepth = 0;
  for (let i = 0; i < condition.length; i++) {
    const char = condition[i];
    if (char === '(') parenDepth++;
    else if (char === ')') parenDepth--;
    if (parenDepth === 0 && condition.substring(i, i + 4).toUpperCase() === ' OR ') {
      orParts.push(current.trim());
      current = '';
      i += 3;
      continue;
    }
    current += char;
  }
  if (current.trim()) orParts.push(current.trim());
  let paramIndex = 0;
  if (orParts.length > 1) {
    const result = orParts.some((orPart) => {
      const fieldCount = (orPart.match(/=\s*\?/g) || []).length;
      const localParams = params.slice(paramIndex, paramIndex + fieldCount);
      const andResult = evaluateAndCondition(row, orPart, localParams, 0);
      paramIndex += fieldCount;
      return andResult;
    });
    return result;
  }
  return evaluateAndCondition(row, condition, params, paramIndex);
}
function evaluateAndCondition(row: any, condition: string, params: any[], startParamIndex: number): boolean {
  condition = condition.trim();
  if (condition.startsWith('(') && condition.endsWith(')')) {
    condition = condition.slice(1, -1).trim();
  }
  const andParts: string[] = [];
  let current = '';
  let parenDepth = 0;
  for (let i = 0; i < condition.length; i++) {
    const char = condition[i];
    if (char === '(') parenDepth++;
    else if (char === ')') parenDepth--;
    if (parenDepth === 0 && condition.substring(i, i + 4).toUpperCase() === ' AND') {
      andParts.push(current.trim());
      current = '';
      i += 3;
      continue;
    }
    current += char;
  }
  if (current.trim()) andParts.push(current.trim());
  let paramIndex = startParamIndex;
  return andParts.every(andPart => {
    andPart = andPart.trim();
    if (andPart.startsWith('(') && andPart.endsWith(')')) {
      andPart = andPart.slice(1, -1).trim();
    }
    const eqIndex = andPart.indexOf('=');
    if (eqIndex === -1) return true;
    const field = andPart.substring(0, eqIndex).trim();
    const valueStr = andPart.substring(eqIndex + 1).trim();
    if (valueStr === '?') {
      const paramValue = params[paramIndex];
      paramIndex++;
      return row[field] === paramValue;
    } else {
      const cleanValue = valueStr.replace(/^'|'$/g, '').replace(/^"|"$/g, '');
      return row[field] === cleanValue;
    }
  });
  return result;
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
  const storeName = extractStoreName(sql);
  if (!storeName) {
    return;
  }
  const setMatch = sql.match(/SET\s+(.+?)(?:\s+WHERE|\s*$)/i);
  const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s*$)/i);
  if (!setMatch) {
    return;
  }
  const updates: any = {};
  let paramIndex = 0;
  const setClause = setMatch[1];
  const parts: string[] = [];
  let current = '';
  let parenDepth = 0;
  for (let i = 0; i < setClause.length; i++) {
    const char = setClause[i];
    if (char === '(') parenDepth++;
    else if (char === ')') parenDepth--;
    else if (char === ',' && parenDepth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());
  parts.forEach(part => {
    const equalIndex = part.indexOf('=');
    if (equalIndex === -1) return;
    const field = part.substring(0, equalIndex).trim();
    const value = part.substring(equalIndex + 1).trim();
    if (value === '?') {
      updates[field] = params[paramIndex] !== undefined ? params[paramIndex] : null;
      paramIndex++;
    } else if (value.includes("datetime('now')") || value.includes("NOW()")) {
      updates[field] = new Date().toISOString();
    } else {
      updates[field] = value.replace(/^'|'$/g, '').replace(/^"|"$/g, '');
    }
  });
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const getAllRequest = store.getAll();
    let itemsToUpdate: any[] = [];
    getAllRequest.onsuccess = () => {
      const items = getAllRequest.result;
      items.forEach((item: any) => {
        let shouldUpdate = true;
        if (whereMatch) {
          const whereCondition = whereMatch[1];
          const whereParts = whereCondition.split('=').map(s => s.trim());
          if (whereParts.length === 2) {
            const whereField = whereParts[0];
            const whereValue = whereParts[1];
            const whereParam = whereValue === '?' ? params[params.length - 1] : whereValue.replace(/^'|'$/g, '').replace(/^"|"$/g, '');
            shouldUpdate = String(item[whereField]) === String(whereParam);
          }
        }
        if (shouldUpdate) {
          const updatedItem = { ...item };
          Object.keys(updates).forEach(key => {
            updatedItem[key] = updates[key];
          });
          itemsToUpdate.push(updatedItem);
        }
      });
      if (itemsToUpdate.length === 0) {
        resolve();
        return;
      }
      itemsToUpdate.forEach((updatedItem, index) => {
        const putRequest = store.put(updatedItem);
        putRequest.onsuccess = () => {
        };
        putRequest.onerror = () => {
        };
      });
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = () => {
        reject(transaction.error);
      };
    };
    getAllRequest.onerror = () => {
      reject(getAllRequest.error);
    };
  });
}
async function deleteRecord(db: IDBDatabase, sql: string, params: any[]): Promise<void> {
  const storeName = extractStoreName(sql);
  if (!storeName) return;
  const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s*$)/i);
  if (!whereMatch) return;
  const whereCondition = whereMatch[1];
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const getAllRequest = store.getAll();
    getAllRequest.onsuccess = () => {
      const items = getAllRequest.result;
      let deletedCount = 0;
      items.forEach((item: any) => {
        if (evaluateWhereCondition(item, whereCondition, params)) {
          store.delete(item.id);
          deletedCount++;
        }
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
    getAllRequest.onerror = () => reject(getAllRequest.error);
  });
}