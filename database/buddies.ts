import { getDatabase } from './init';
import { Buddy, Profile } from './types';

export const createBuddyRequest = async (
  id: string,
  senderId: string,
  receiverId: string
): Promise<void> => {
  console.log('[Buddies] createBuddyRequest called with:', { id, senderId, receiverId });
  const db = await getDatabase();
  try {
    // First check if request already exists
    const existing = await checkBuddyRequestExists(senderId, receiverId);
    if (existing) {
      console.log('[Buddies] Request already exists, not creating duplicate');
      throw new Error('Buddy request already exists between these users');
    }

    const result = await db.runAsync(
      'INSERT INTO buddies (id, sender_id, receiver_id, status) VALUES (?, ?, ?, ?)',
      [id, senderId, receiverId, 'pending']
    );
    console.log('[Buddies] createBuddyRequest result:', result);
    console.log('[Buddies] Buddy request created successfully');
  } catch (error: any) {
    console.error('[Buddies] Error creating buddy request:', error);
    console.error('[Buddies] Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
      name: error?.name,
    });
    // Check if it's a unique constraint error (request already exists)
    if (error?.message?.includes('UNIQUE constraint') || 
        error?.message?.includes('already exists') ||
        error?.code === 'SQLITE_CONSTRAINT' ||
        error?.code === 19) {
      console.log('[Buddies] Request already exists (unique constraint)');
      throw new Error('Buddy request already exists between these users');
    }
    // Re-throw the error if it's not a constraint error
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
  
  const results = await Promise.all(
    buddies.map(async (buddy) => {
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
  if (status === 'rejected') {
    // Delete the request if rejected
    await db.runAsync('DELETE FROM buddies WHERE id = ?', [requestId]);
  } else {
    // Update status to accepted
    await db.runAsync(
      'UPDATE buddies SET status = ?, updated_at = datetime(\'now\') WHERE id = ?',
      [status, requestId]
    );
  }
};

export const checkBuddyRequestExists = async (
  senderId: string,
  receiverId: string
): Promise<Buddy | null> => {
  console.log('[Buddies] checkBuddyRequestExists called with:', { senderId, receiverId });
  const db = await getDatabase();
  try {
    const result = await db.getFirstAsync<Buddy>(
      'SELECT * FROM buddies WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
      [senderId, receiverId, receiverId, senderId]
    );
    console.log('[Buddies] checkBuddyRequestExists result:', result ? 'exists' : 'not found');
    return result || null;
  } catch (error) {
    console.error('[Buddies] Error checking buddy request:', error);
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
