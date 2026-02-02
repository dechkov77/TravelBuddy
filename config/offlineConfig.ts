export const OFFLINE_CONFIG = {
  SYNC_RETRY_MAX_ATTEMPTS: 3,
  SYNC_RETRY_DELAY_MS: 5000,
  SYNC_BATCH_SIZE: 10,
  QUEUE_STORAGE_KEY: 'travelbuddy_sync_queue',
  MAX_QUEUE_SIZE: 500,
  OPERATION_TIMEOUT_MS: 30000,
  SYNC_TIMEOUT_MS: 120000,
  OFFLINE_ERROR_MESSAGE: 'Changes saved locally and will sync when online',
  SYNC_IN_PROGRESS_MESSAGE: 'Syncing your changes...',
  SYNC_COMPLETE_MESSAGE: 'Your changes have been synced',
  SYNC_FAILED_MESSAGE: 'Some changes failed to sync. Will retry when online.',
};
export const SYNC_STRATEGIES = {
  OPTIMISTIC: 'optimistic',
  PESSIMISTIC: 'pessimistic',
  HYBRID: 'hybrid',
};
export const DEFAULT_SYNC_STRATEGY = SYNC_STRATEGIES.OPTIMISTIC;