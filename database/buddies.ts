import { getDatabase } from './init';
import { Buddy, Profile } from './types';
export const createBuddyRequest = async (
  id: string,
  senderId: string,
  receiverId: string
): Promise<void> => {
  const db = await getDatabase();
  try {
    const existing = await checkBuddyRequestExists(senderId, receiverId);
    if (existing) {
      if (existing.status === 'accepted') {
        throw new Error('You are already buddies with this user');
      } else {
        throw new Error('You already have a pending buddy request with this user');
      }
    }
    const result = await db.runAsync(
      'INSERT INTO buddies (id, sender_id, receiver_id, status) VALUES (?, ?, ?, ?)',
      [id, senderId, receiverId, 'pending']
    );
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE constraint') || 
        error?.message?.includes('already exists') ||
        error?.code === 'SQLITE_CONSTRAINT' ||
        error?.code === 19) {
      throw new Error('Buddy request already exists between these users');
    }
    throw error;
  }
};
export const getBuddyRequests = async (
  userId: string,
  type: 'sent' | 'received' | 'accepted'
): Promise<Buddy[]> => {
  const db = await getDatabase();
  if (type === 'sent') {
    return await db.getAllAsync<Buddy>(
      'SELECT * FROM buddies WHERE sender_id = ? AND status = ? ORDER BY created_at DESC',
      [userId, 'pending']
    );
  } else if (type === 'received') {
    return await db.getAllAsync<Buddy>(
      'SELECT * FROM buddies WHERE receiver_id = ? AND status = ? ORDER BY created_at DESC',
      [userId, 'pending']
    );
  } else {
    return await db.getAllAsync<Buddy>(
      'SELECT * FROM buddies WHERE (sender_id = ? OR receiver_id = ?) AND status = ? ORDER BY created_at DESC',
      [userId, userId, 'accepted']
    );
  }
};
export const getBuddyRequestWithProfiles = async (
  userId: string,
  type: 'sent' | 'received' | 'accepted'
): Promise<Array<Buddy & { sender: Profile | null; receiver: Profile | null }>> => {
  const db = await getDatabase();
  const buddies = await getBuddyRequests(userId, type);
  const seenBuddyIds = new Set<string>();
  const uniqueBuddies = buddies.filter(buddy => {
    const buddyId = buddy.sender_id === userId ? buddy.receiver_id : buddy.sender_id;
    if (seenBuddyIds.has(buddyId)) {
      return false;
    }
    seenBuddyIds.add(buddyId);
    return true;
  });
  const results = await Promise.all(
    uniqueBuddies.map(async (buddy) => {
      const sender = await db.getFirstAsync<Profile>(
        'SELECT * FROM profiles WHERE id = ?',
        [buddy.sender_id]
      );
      const receiver = await db.getFirstAsync<Profile>(
        'SELECT * FROM profiles WHERE id = ?',
        [buddy.receiver_id]
      );
      let senderProfile = sender ? { ...sender } : null;
      let receiverProfile = receiver ? { ...receiver } : null;
      if (senderProfile) {
        if (typeof senderProfile.travel_interests === 'string') {
          try {
            senderProfile.travel_interests = JSON.parse(senderProfile.travel_interests);
          } catch {
            senderProfile.travel_interests = [];
          }
        } else if (!senderProfile.travel_interests) {
          senderProfile.travel_interests = [];
        }
      }
      if (receiverProfile) {
        if (typeof receiverProfile.travel_interests === 'string') {
          try {
            receiverProfile.travel_interests = JSON.parse(receiverProfile.travel_interests);
          } catch {
            receiverProfile.travel_interests = [];
          }
        } else if (!receiverProfile.travel_interests) {
          receiverProfile.travel_interests = [];
        }
      }
      return {
        ...buddy,
        sender: senderProfile,
        receiver: receiverProfile,
      };
    })
  );
  return results;
};
export const updateBuddyRequestStatus = async (
  requestId: string,
  status: 'accepted' | 'rejected'
): Promise<void> => {
  const db = await getDatabase();
  try {
    if (status === 'rejected') {
      await db.runAsync('DELETE FROM buddies WHERE id = ?', [requestId]);
    } else {
      await db.runAsync(
        'UPDATE buddies SET status = ?, updated_at = datetime(\'now\') WHERE id = ?',
        [status, requestId]
      );
    }
  } catch (error: any) {
    throw error;
  }
};
export const checkBuddyRequestExists = async (
  senderId: string,
  receiverId: string
): Promise<Buddy | null> => {
  const db = await getDatabase();
  try {
    const result = await db.getFirstAsync<Buddy>(
      'SELECT * FROM buddies WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
      [senderId, receiverId, receiverId, senderId]
    );
    if (result) {
    }
    return result || null;
  } catch (error) {
    return null;
  }
};
export const getAcceptedBuddies = async (userId: string): Promise<Buddy[]> => {
  const db = await getDatabase();
  return await db.getAllAsync<Buddy>(
    'SELECT * FROM buddies WHERE (sender_id = ? OR receiver_id = ?) AND status = ? ORDER BY created_at DESC',
    [userId, userId, 'accepted']
  );
};
export const removeBuddy = async (userId: string, buddyId: string): Promise<void> => {
  const db = await getDatabase();
  try {
    await db.runAsync(
      'DELETE FROM buddies WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
      [userId, buddyId, buddyId, userId]
    );
  } catch (error: any) {
    throw error;
  }
};
export const cleanupDuplicateBuddies = async (): Promise<void> => {
  const db = await getDatabase();
  try {
    const allBuddies = await db.getAllAsync<Buddy>('SELECT * FROM buddies ORDER BY created_at ASC');
    const seenPairs = new Map<string, Buddy[]>();
    allBuddies.forEach(buddy => {
      const pair = [buddy.sender_id, buddy.receiver_id].sort().join('|');
      if (!seenPairs.has(pair)) {
        seenPairs.set(pair, []);
      }
      seenPairs.get(pair)!.push(buddy);
    });
    const duplicatesToDelete: string[] = [];
    seenPairs.forEach((buddies, pair) => {
      if (buddies.length > 1) {
        buddies.sort((a, b) => {
          if (a.status === 'accepted' && b.status !== 'accepted') return -1;
          if (b.status === 'accepted' && a.status !== 'accepted') return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        for (let i = 1; i < buddies.length; i++) {
          duplicatesToDelete.push(buddies[i].id);
        }
      }
    });
    if (duplicatesToDelete.length > 0) {
      for (const buddyId of duplicatesToDelete) {
        await db.runAsync('DELETE FROM buddies WHERE id = ?', [buddyId]);
      }
    } else {
    }
  } catch (error: any) {
  }
};