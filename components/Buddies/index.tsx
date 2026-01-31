import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useBuddiesLogic } from './logic';
import { useTheme } from '../../contexts/ThemeContext';
import { styles } from './styles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import PublicProfile from '../PublicProfile';

interface BuddiesProps {
  onNavigate?: (screen: 'home' | 'explore' | 'trips' | 'buddies' | 'profile' | 'chat') => void;
}
export default function Buddies({ onNavigate }: BuddiesProps = {}) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const {
    loading,
    activeTab,
    setActiveTab,
    received,
    sent,
    accepted,
    processing,
    handleRequest,
  } = useBuddiesLogic();
  const [viewingProfile, setViewingProfile] = useState<string | null>(null);

  const onHandleRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    const result = await handleRequest(requestId, status);
    if (result.success) {
      Alert.alert('Success', `Request ${status === 'accepted' ? 'accepted' : 'rejected'}`);
    } else {
      Alert.alert('Error', result.error || 'Failed to update request');
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>Buddy Requests</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Manage your travel connections</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && [styles.tabActive, { borderBottomColor: theme.primary }]]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' ? [styles.tabTextActive, { color: theme.primary }] : { color: theme.textSecondary }]}>
            Received ({received.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && [styles.tabActive, { borderBottomColor: theme.primary }]]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' ? [styles.tabTextActive, { color: theme.primary }] : { color: theme.textSecondary }]}>
            Sent ({sent.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buddies' && [styles.tabActive, { borderBottomColor: theme.primary }]]}
          onPress={() => setActiveTab('buddies')}
        >
          <Text style={[styles.tabText, activeTab === 'buddies' ? [styles.tabTextActive, { color: theme.primary }] : { color: theme.textSecondary }]}>
            Buddies ({accepted.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Received Requests */}
      {activeTab === 'received' && (
        <View style={styles.requestsGrid}>
          {received.map((request) => (
            <View key={request.id} style={[styles.requestCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
              <TouchableOpacity
                style={styles.requestHeader}
                onPress={() => setViewingProfile(request.sender_id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.requestName, { color: theme.text }]}>{request.sender?.name || 'Unknown'}</Text>
                  {request.sender?.country && (
                    <Text style={[styles.requestLocation, { color: theme.textSecondary }]}>{request.sender.country}</Text>
                  )}
                </View>
              </TouchableOpacity>
              {Array.isArray(request.sender?.travel_interests) &&
                request.sender.travel_interests.length > 0 && (
                  <View style={styles.interestsContainer}>
                    {request.sender.travel_interests.map((interest, idx) => (
                      <View key={idx} style={[styles.interestBadge, { backgroundColor: theme.secondary, borderColor: theme.primary }]}>
                        <Text style={[styles.interestText, { color: theme.text }]}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                )}
              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => onHandleRequest(request.id, 'accepted')}
                  disabled={processing === request.id}
                >
                  {processing === request.id ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => onHandleRequest(request.id, 'rejected')}
                  disabled={processing === request.id}
                >
                  <Ionicons name="close" size={20} color="#333" />
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {received.length === 0 && <Text style={styles.emptyText}>No pending requests</Text>}
        </View>
      )}

      {/* Sent Requests */}
      {activeTab === 'sent' && (
        <View style={styles.requestsGrid}>
          {sent.map((request) => (
            <View key={request.id} style={[styles.requestCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
              <TouchableOpacity
                style={styles.requestHeader}
                onPress={() => setViewingProfile(request.receiver_id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.requestName, { color: theme.text }]}>{request.receiver?.name || 'Unknown'}</Text>
                  {request.receiver?.country && (
                    <Text style={[styles.requestLocation, { color: theme.textSecondary }]}>{request.receiver.country}</Text>
                  )}
                </View>
                <View style={[styles.badge, styles.badgePending]}>
                  <Text style={[styles.badgeText, styles.badgeTextPending]}>Pending</Text>
                </View>
              </TouchableOpacity>
              {Array.isArray(request.receiver?.travel_interests) &&
                request.receiver.travel_interests.length > 0 && (
                  <View style={styles.interestsContainer}>
                    {request.receiver.travel_interests.map((interest, idx) => (
                      <View key={idx} style={[styles.interestBadge, { backgroundColor: theme.secondary, borderColor: theme.primary }]}>
                        <Text style={[styles.interestText, { color: theme.text }]}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                )}
            </View>
          ))}
          {sent.length === 0 && <Text style={styles.emptyText}>No sent requests</Text>}
        </View>
      )}

      {/* Accepted Buddies */}
      {activeTab === 'buddies' && (
        <View style={styles.requestsGrid}>
          {accepted.map((request) => {
            const buddy = request.sender?.id === user?.id ? request.receiver : request.sender;
            const buddyId = request.sender?.id === user?.id ? request.receiver_id : request.sender_id;
            return (
              <View key={request.id} style={[styles.requestCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
                <TouchableOpacity
                  style={styles.requestHeader}
                  onPress={() => setViewingProfile(buddyId)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.requestName, { color: theme.text }]}>{buddy?.name || 'Unknown'}</Text>
                    {buddy?.country && (
                      <Text style={[styles.requestLocation, { color: theme.textSecondary }]}>{buddy.country}</Text>
                    )}
                  </View>
                  <View style={[styles.badge, styles.badgeAccepted]}>
                    <Ionicons name="people" size={12} color="#FFFFFF" />
                    <Text style={[styles.badgeText, styles.badgeTextAccepted]}>Buddy</Text>
                  </View>
                </TouchableOpacity>
                {Array.isArray(buddy?.travel_interests) && buddy.travel_interests.length > 0 && (
                  <View style={styles.interestsContainer}>
                    {buddy.travel_interests.map((interest, idx) => (
                      <View key={idx} style={[styles.interestBadge, { backgroundColor: theme.secondary, borderColor: theme.primary }]}>
                        <Text style={[styles.interestText, { color: theme.text }]}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
          {accepted.length === 0 && (
            <>
              <Text style={styles.emptyText}>No travel buddies yet</Text>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => router.push('/explore')}
              >
                <Text style={styles.acceptButtonText}>Find Buddies</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}
