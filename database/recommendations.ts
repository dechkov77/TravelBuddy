import { getDatabase } from './init';
import { Recommendation } from './types';
export const createRecommendation = async (
  id: string,
  tripId: string,
  userId: string,
  title: string,
  description?: string,
  category?: string,
  location?: string,
  rating?: number
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO recommendations (id, trip_id, user_id, title, description, category, location, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      tripId,
      userId,
      title,
      description || null,
      category || null,
      location || null,
      rating || null,
    ]
  );
};
export const getRecommendationsByTripId = async (tripId: string): Promise<Recommendation[]> => {
  const db = await getDatabase();
  return await db.getAllAsync<Recommendation>(
    'SELECT * FROM recommendations WHERE trip_id = ? ORDER BY rating DESC, created_at DESC',
    [tripId]
  );
};
export const updateRecommendation = async (
  recommendationId: string,
  updates: Partial<{
    title: string;
    description: string;
    category: string;
    location: string;
    rating: number;
  }>
): Promise<void> => {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.category !== undefined) {
    fields.push('category = ?');
    values.push(updates.category);
  }
  if (updates.location !== undefined) {
    fields.push('location = ?');
    values.push(updates.location);
  }
  if (updates.rating !== undefined) {
    fields.push('rating = ?');
    values.push(updates.rating);
  }
  values.push(recommendationId);
  await db.runAsync(
    `UPDATE recommendations SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
};
export const deleteRecommendation = async (recommendationId: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM recommendations WHERE id = ?', [recommendationId]);
};