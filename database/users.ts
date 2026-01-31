import { getDatabase } from './init';
import { User } from './types';

export const createUser = async (
  id: string,
  email: string,
  name: string,
  passwordHash: string
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)',
    [id, email, name, passwordHash]
  );
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<User>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return result || null;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<User>(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return result || null;
};

// Simple password hash (in production, use bcrypt or similar)
export const hashPassword = (password: string): string => {
  // This is a simple hash for demo purposes - use proper crypto in production
  return btoa(password); // Base64 encoding (not secure, just for demo)
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};
