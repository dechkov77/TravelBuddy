import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import * as ChatService from '../../database/chat';
import * as ProfileService from '../../database/profiles';
import * as BuddyService from '../../database/buddies';
import { ChatMessage, Profile } from '../../database/types';
import { styles } from './styles';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import PublicProfile from '../PublicProfile';

interface ChatProps {
  initialUserId?: string;
  onNavigate?: (screen: 'home' | 'explore' | 'trips' | 'buddies' | 'profile' | 'chat') => void;
}

export default function Chat({ initialUserId, onNavigate }: ChatProps = {}) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [conversations, setConversations] = useState<Array<{
    otherUserId: string;
    otherUser: Profile | null;
    lastMessage: ChatMessage | null;
    unreadCount: number;
  }>>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(initialUserId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewingProfile, setViewingProfile] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/auth');
      return;
    }
    fetchConversations();
    
    // Check if we should open a specific conversation (from PublicProfile)
    const checkForStoredUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('openChatWithUserId');
        if (storedUserId && !selectedConversation) {
          console.log('[Chat] Opening conversation with user from AsyncStorage:', storedUserId);
          setSelectedConversation(storedUserId);
          await fetchMessages(storedUserId);
          await AsyncStorage.removeItem('openChatWithUserId');
        } else if (initialUserId && !selectedConversation) {
          setSelectedConversation(initialUserId);
          await fetchMessages(initialUserId);
        }
      } catch (error) {
        console.error('[Chat] Error checking stored userId:', error);
      }
    };
    
    checkForStoredUserId();
    
    // Poll for new messages every 2 seconds
    pollIntervalRef.current = setInterval(() => {
      if (selectedConversation) {
        fetchMessages(selectedConversation);
      }
      fetchConversations();
    }, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [user, selectedConversation, initialUserId]);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      const convos = await ChatService.getConversations(user.id);
      const withProfiles = await Promise.all(
        convos.map(async (conv) => {
          const profile = await ProfileService.getProfile(conv.otherUserId);
          return {
            ...conv,
            otherUser: profile,
          };
        })
      );
      setConversations(withProfiles);
    } catch (error) {
      console.error('[Chat] Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    if (!user) return;
    try {
      const msgs = await ChatService.getChatMessages(user.id, otherUserId);
      setMessages(msgs);
      // Mark messages as read
      await ChatService.markMessagesAsRead(otherUserId, user.id);
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('[Chat] Error fetching messages:', error);
    }
  };

  const handleSelectConversation = async (otherUserId: string) => {
    setSelectedConversation(otherUserId);
    await fetchMessages(otherUserId);
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !messageText.trim()) return;
    setSending(true);
    try {
      const messageId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await ChatService.createChatMessage(
        messageId,
        user.id,
        selectedConversation,
        messageText.trim()
      );
      setMessageText('');
      await fetchMessages(selectedConversation);
      await fetchConversations();
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (viewingProfile) {
    return <PublicProfile userId={viewingProfile} onClose={() => setViewingProfile(null)} onNavigate={onNavigate} />;
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (selectedConversation) {
    const otherUser = conversations.find(c => c.otherUserId === selectedConversation)?.otherUser;
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.chatHeader, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
          <TouchableOpacity onPress={() => setSelectedConversation(null)}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chatHeaderUser}
            onPress={() => setViewingProfile(selectedConversation)}
          >
            {otherUser?.profile_picture ? (
              <Image
                source={{ uri: otherUser.profile_picture }}
                style={styles.chatHeaderAvatar}
              />
            ) : (
              <View style={[styles.chatHeaderAvatarPlaceholder, { backgroundColor: theme.inputBackground }]}>
                <Ionicons name="person" size={20} color={theme.textSecondary} />
              </View>
            )}
            <Text style={[styles.chatHeaderName, { color: theme.text }]}>{otherUser?.name || 'Unknown'}</Text>
          </TouchableOpacity>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={[styles.messagesContainer, { backgroundColor: theme.background }]}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => {
            const isMe = message.sender_id === user?.id;
            return (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  isMe
                    ? [styles.myMessage, { backgroundColor: theme.primary }]
                    : [styles.theirMessage, { backgroundColor: theme.surface }]
                ]}
              >
                <Text style={[
                  styles.messageText,
                  isMe ? styles.myMessageText : { color: theme.text }
                ]}>
                  {message.content}
                </Text>
                <Text style={[
                  styles.messageTime,
                  isMe && styles.myMessageTime,
                  !isMe && { color: theme.textSecondary }
                ]}>
                  {format(new Date(message.created_at), 'HH:mm')}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderTopColor: theme.divider }]}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
                color: theme.inputText,
              }
            ]}
            placeholder="Type a message..."
            placeholderTextColor={theme.textSecondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: theme.primary }, sending && { opacity: 0.6 }]}
            onPress={sendMessage}
            disabled={sending || !messageText.trim()}
          >
            {sending ? (
              <ActivityIndicator color={theme.buttonText} />
            ) : (
              <Ionicons name="send" size={20} color={theme.buttonText} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <Text style={[styles.title, { color: theme.text }]}>Messages</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Chat with your travel buddies</Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No conversations yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Start chatting with your buddies!</Text>
        </View>
      ) : (
        <View style={styles.conversationsList}>
          {conversations.map((conv) => (
            <TouchableOpacity
              key={conv.otherUserId}
              style={[styles.conversationItem, { backgroundColor: theme.surface }]}
              onPress={() => handleSelectConversation(conv.otherUserId)}
            >
              {conv.otherUser?.profile_picture ? (
                <Image
                  source={{ uri: conv.otherUser.profile_picture }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.inputBackground }]}>
                  <Ionicons name="person" size={24} color={theme.textSecondary} />
                </View>
              )}
              <View style={styles.conversationInfo}>
                <View style={styles.conversationHeader}>
                  <Text style={[styles.conversationName, { color: theme.text }]}>
                    {conv.otherUser?.name || 'Unknown'}
                  </Text>
                  {conv.unreadCount > 0 && (
                    <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                      <Text style={[styles.unreadText, { color: theme.buttonText }]}>{conv.unreadCount}</Text>
                    </View>
                  )}
                </View>
                {conv.lastMessage && (
                  <Text style={[styles.lastMessage, { color: theme.textSecondary }]} numberOfLines={1}>
                    {conv.lastMessage.content}
                  </Text>
                )}
                {conv.lastMessage && (
                  <Text style={[styles.lastMessageTime, { color: theme.textSecondary }]}>
                    {format(new Date(conv.lastMessage.created_at), 'MMM d, HH:mm')}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
