import { getDatabase } from './init';
import { ItineraryItem } from './types';

export const createItineraryItem = async (
  id: string,
  tripId: string,
  day: number,
  title: string,
  description?: string,
  time?: string,
  location?: string
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO itinerary_items (id, trip_id, day, title, description, time, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, tripId, day, title, description || null, time || null, location || null]
  );
};

export const getItineraryItemsByTripId = async (tripId: string): Promise<ItineraryItem[]> => {
  const db = await getDatabase();
  return await db.getAllAsync<ItineraryItem>(
    'SELECT * FROM itinerary_items WHERE trip_id = ? ORDER BY day ASC, time ASC',
    [tripId]
  );
};

export const updateItineraryItem = async (
  itemId: string,
  updates: Partial<{
    day: number;
    title: string;
    description: string;
    time: string;
    location: string;
  }>
): Promise<void> => {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.day !== undefined) {
    fields.push('day = ?');
    values.push(updates.day);
  }
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.time !== undefined) {
    fields.push('time = ?');
    values.push(updates.time);
  }
  if (updates.location !== undefined) {
    fields.push('location = ?');
    values.push(updates.location);
  }

  values.push(itemId);

  await db.runAsync(
    `UPDATE itinerary_items SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
};

export const deleteItineraryItem = async (itemId: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM itinerary_items WHERE id = ?', [itemId]);
};
