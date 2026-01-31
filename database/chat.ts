import { getDatabase } from './init';
import { ChatMessage } from './types';

export const createChatMessage = async (
  id: string,
  senderId: string,
  receiverId: string,
  content: string
): Promise<void> => {
  console.log('[Chat] createChatMessage called with:', { id, senderId, receiverId, contentLength: content.length });
  const db = await getDatabase();
  try {
    await db.runAsync(
      'INSERT INTO chat_messages (id, sender_id, receiver_id, content, read) VALUES (?, ?, ?, ?, ?)',
      [id, senderId, receiverId, content, 0]
    );
    console.log('[Chat] Message created successfully');
  } catch (error: any) {
    console.error('[Chat] Error creating message:', error);
    throw error;
  }
};

export const getChatMessages = async (
  userId1: string,
  userId2: string
): Promise<ChatMessage[]> => {
  console.log('[Chat] getChatMessages called with:', { userId1, userId2 });
  const db = await getDatabase();
  try {
    const messages = await db.getAllAsync<ChatMessage>(
      `SELECT * FROM chat_messages 
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [userId1, userId2, userId2, userId1]
    );
    console.log('[Chat] Retrieved messages:', messages.length);
    return messages;
  } catch (error) {
    console.error('[Chat] Error getting messages:', error);
    return [];
  }
};

export const getConversations = async (userId: string): Promise<Array<{
  otherUserId: string;
  lastMessage: ChatMessage | null;
  unreadCount: number;
}>> => {
  console.log('[Chat] getConversations called for user:', userId);
  const db = await getDatabase();
  try {
    // Get all unique conversation partners
    const conversations = await db.getAllAsync<{ other_user_id: string; last_message_id: string }>(
      `SELECT 
        CASE 
          WHEN sender_id = ? THEN receiver_id 
          ELSE sender_id 
        END as other_user_id,
        MAX(id) as last_message_id
       FROM chat_messages 
       WHERE sender_id = ? OR receiver_id = ?
       GROUP BY other_user_id
       ORDER BY MAX(created_at) DESC`,
      [userId, userId, userId]
    );

    const result = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await db.getFirstAsync<ChatMessage>(
          'SELECT * FROM chat_messages WHERE id = ?',
          [conv.last_message_id]
        );
        const unreadCount = await db.getFirstAsync<{ count: number }>(
          `SELECT COUNT(*) as count FROM chat_messages 
           WHERE sender_id = ? AND receiver_id = ? AND read = 0`,
          [conv.other_user_id, userId]
        );
        return {
          otherUserId: conv.other_user_id,
          lastMessage: lastMessage || null,
          unreadCount: unreadCount?.count || 0,
        };
      })
    );

    console.log('[Chat] Retrieved conversations:', result.length);
    return result;
  } catch (error) {
    console.error('[Chat] Error getting conversations:', error);
    return [];
  }
};

export const markMessagesAsRead = async (
  senderId: string,
  receiverId: string
): Promise<void> => {
  console.log('[Chat] markMessagesAsRead called:', { senderId, receiverId });
  const db = await getDatabase();
  try {
    await db.runAsync(
      'UPDATE chat_messages SET read = 1 WHERE sender_id = ? AND receiver_id = ? AND read = 0',
      [senderId, receiverId]
    );
    console.log('[Chat] Messages marked as read');
  } catch (error) {
    console.error('[Chat] Error marking messages as read:', error);
  }
};
