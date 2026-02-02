import { getDatabase } from './init';
import { Expense } from './types';
export const createExpense = async (
  id: string,
  tripId: string,
  userId: string,
  title: string,
  amount: number,
  category?: string,
  description?: string,
  splitAmong?: string[]
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO expenses (id, trip_id, user_id, title, amount, category, description, split_among) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      tripId,
      userId,
      title,
      amount,
      category || null,
      description || null,
      JSON.stringify(splitAmong || []),
    ]
  );
};
export const getExpensesByTripId = async (tripId: string): Promise<Expense[]> => {
  const db = await getDatabase();
  const results = await db.getAllAsync<Expense>(
    'SELECT * FROM expenses WHERE trip_id = ? ORDER BY created_at DESC',
    [tripId]
  );
  return results.map((expense) => {
    if (expense.split_among) {
      try {
        expense.split_among = JSON.parse(expense.split_among as any);
      } catch {
        expense.split_among = [];
      }
    }
    return expense;
  });
};
export const updateExpense = async (
  expenseId: string,
  updates: Partial<{
    title: string;
    amount: number;
    category: string;
    description: string;
    split_among: string[];
  }>
): Promise<void> => {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.amount !== undefined) {
    fields.push('amount = ?');
    values.push(updates.amount);
  }
  if (updates.category !== undefined) {
    fields.push('category = ?');
    values.push(updates.category);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.split_among !== undefined) {
    fields.push('split_among = ?');
    values.push(JSON.stringify(updates.split_among));
  }
  values.push(expenseId);
  await db.runAsync(`UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`, values);
};
export const deleteExpense = async (expenseId: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM expenses WHERE id = ?', [expenseId]);
};