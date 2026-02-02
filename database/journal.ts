import { getDatabase } from './init';
import { JournalEntry } from './types';
export const createJournalEntry = async (
  id: string,
  tripId: string,
  userId: string,
  title: string,
  content: string,
  date: string,
  photos?: string[],
  location?: string
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO journal_entries (id, trip_id, user_id, title, content, photos, date, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      tripId,
      userId,
      title,
      content,
      JSON.stringify(photos || []),
      date,
      location || null,
    ]
  );
};
export const getJournalEntriesByTripId = async (tripId: string): Promise<JournalEntry[]> => {
  const db = await getDatabase();
  const results = await db.getAllAsync<JournalEntry>(
    'SELECT * FROM journal_entries WHERE trip_id = ? ORDER BY date DESC, created_at DESC',
    [tripId]
  );
  return results.map((entry) => {
    if (entry.photos) {
      try {
        entry.photos = JSON.parse(entry.photos as any);
      } catch {
        entry.photos = [];
      }
    }
    return entry;
  });
};
export const updateJournalEntry = async (
  entryId: string,
  updates: Partial<{
    title: string;
    content: string;
    photos: string[];
    date: string;
    location: string;
  }>
): Promise<void> => {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.content !== undefined) {
    fields.push('content = ?');
    values.push(updates.content);
  }
  if (updates.photos !== undefined) {
    fields.push('photos = ?');
    values.push(JSON.stringify(updates.photos));
  }
  if (updates.date !== undefined) {
    fields.push('date = ?');
    values.push(updates.date);
  }
  if (updates.location !== undefined) {
    fields.push('location = ?');
    values.push(updates.location);
  }
  values.push(entryId);
  await db.runAsync(`UPDATE journal_entries SET ${fields.join(', ')} WHERE id = ?`, values);
};
export const deleteJournalEntry = async (entryId: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM journal_entries WHERE id = ?', [entryId]);
};