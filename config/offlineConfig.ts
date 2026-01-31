/**
 * Offline Configuration
 * Settings for offline functionality and behavior
 */

export const OFFLINE_CONFIG = {
  // Sync settings
  SYNC_RETRY_MAX_ATTEMPTS: 3,
  SYNC_RETRY_DELAY_MS: 5000, // 5 seconds between retries
  SYNC_BATCH_SIZE: 10, // Process max 10 operations at a time

  // Queue settings
  QUEUE_STORAGE_KEY: 'travelbuddy_sync_queue',
  MAX_QUEUE_SIZE: 500, // Max operations to queue

  // Timeout settings
  OPERATION_TIMEOUT_MS: 30000, // 30 seconds per operation
  SYNC_TIMEOUT_MS: 120000, // 2 minutes total sync time

  // Error messages
  OFFLINE_ERROR_MESSAGE: 'Changes saved locally and will sync when online',
  SYNC_IN_PROGRESS_MESSAGE: 'Syncing your changes...',
  SYNC_COMPLETE_MESSAGE: 'Your changes have been synced',
  SYNC_FAILED_MESSAGE: 'Some changes failed to sync. Will retry when online.',
};

export const SYNC_STRATEGIES = {
  OPTIMISTIC: 'optimistic', // Update local state immediately
  PESSIMISTIC: 'pessimistic', // Wait for sync confirmation
  HYBRID: 'hybrid', // Optimistic but with validation
};

export const DEFAULT_SYNC_STRATEGY = SYNC_STRATEGIES.OPTIMISTIC;
