import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '../../contexts/NetworkContext';
import { useTheme } from '../../contexts/ThemeContext';
import syncQueueService from '../../services/syncQueue';
export default function OfflineIndicator() {
  const { isOnline, isConnecting } = useNetwork();
  const { theme } = useTheme();
  const queueSize = syncQueueService.getQueueSize();
  if (isOnline && !isConnecting) {
    return null;
  }
  const displayText = isConnecting
    ? queueSize > 0
      ? `Syncing ${queueSize} change${queueSize > 1 ? 's' : ''}...`
      : 'Reconnecting...'
    : `Offline - ${queueSize} change${queueSize > 1 ? 's' : ''} saved locally`;
  const backgroundColor = isConnecting ? theme.warning : theme.error;
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Ionicons
        name={isConnecting ? 'cloud-upload-outline' : 'cloud-offline-outline'}
        size={16}
        color={theme.buttonText}
        style={styles.icon}
      />
      <Text style={[styles.text, { color: theme.buttonText }]}>{displayText}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
});