import { getDatabase } from './init';
import { Trip } from './types';
export const createTrip = async (
  id: string,
  userId: string,
  destination: string,
  startDate: string,
  endDate: string,
  description?: string
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO trips (id, user_id, destination, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, destination, startDate, endDate, description || null]
  );
  await db.runAsync(
    'INSERT OR IGNORE INTO trip_participants (id, trip_id, user_id) VALUES (?, ?, ?)',
    [`${id}_${userId}`, id, userId]
  );
};
export const getTripsByUserId = async (userId: string): Promise<Trip[]> => {
  const db = await getDatabase();
  return await db.getAllAsync<Trip>(
    'SELECT * FROM trips WHERE user_id = ? ORDER BY start_date ASC',
    [userId]
  );
};
export const getTripById = async (tripId: string): Promise<Trip | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Trip>(
    'SELECT * FROM trips WHERE id = ?',
    [tripId]
  );
  return result || null;
};
export const getTripParticipants = async (tripId: string): Promise<string[]> => {
  const db = await getDatabase();
  const results = await db.getAllAsync<{ user_id: string }>(
    'SELECT user_id FROM trip_participants WHERE trip_id = ?',
    [tripId]
  );
  return results.map((r) => r.user_id);
};
export const updateTrip = async (
  tripId: string,
  updates: Partial<{
    destination: string;
    start_date: string;
    end_date: string;
    description: string;
  }>
): Promise<void> => {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.destination !== undefined) {
    fields.push('destination = ?');
    values.push(updates.destination);
  }
  if (updates.start_date !== undefined) {
    fields.push('start_date = ?');
    values.push(updates.start_date);
  }
  if (updates.end_date !== undefined) {
    fields.push('end_date = ?');
    values.push(updates.end_date);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  fields.push('updated_at = datetime(\'now\')');
  values.push(tripId);
  await db.runAsync(
    `UPDATE trips SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
};
export const deleteTrip = async (tripId: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM trips WHERE id = ?', [tripId]);
};
export const getTripCount = async (): Promise<number> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM trips'
  );
  return result?.count || 0;
};
export const getAllTrips = async (): Promise<Trip[]> => {
  const db = await getDatabase();
  return await db.getAllAsync<Trip>(
    'SELECT * FROM trips ORDER BY start_date DESC'
  );
};