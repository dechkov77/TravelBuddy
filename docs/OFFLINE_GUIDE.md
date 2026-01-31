# Offline Compatibility Guide

This document explains how offline functionality works in TravelBuddy.

## Architecture Overview

The offline system consists of 4 main components:

### 1. **NetworkContext** (`contexts/NetworkContext.tsx`)
- Monitors device connectivity using:
  - `AppState` events (background/foreground) on native platforms
  - `online`/`offline` events on web
- Provides `useNetwork()` hook with:
  - `isOnline`: boolean indicating connectivity status
  - `isConnecting`: boolean indicating reconnection attempt

### 2. **SyncQueue Service** (`services/syncQueue.ts`)
- Stores pending operations in AsyncStorage
- Operations are queued in JSON format for persistence across app restarts
- Provides methods:
  - `addToQueue()`: Queue an operation
  - `getQueue()`: Retrieve all pending operations
  - `removeFromQueue()`: Remove a single operation
  - `clearQueue()`: Clear all operations
  - `getQueueSize()`: Get number of pending operations

### 3. **SyncService** (`services/syncService.ts`)
- Processes queued operations when connectivity returns
- Handles retries and error tracking
- Supports all entity types:
  - Trips (create, update, delete)
  - Expenses (create, update, delete)
  - Itineraries (create, update, delete)
  - Journal entries (create, update, delete)
  - Recommendations (create, update, delete)

### 4. **OfflineIndicator Component** (`components/OfflineIndicator/index.tsx`)
- Shows user the current connectivity status
- Displays:
  - "Offline - X changes saved locally" when offline
  - "Syncing X changes..." when reconnecting
  - Hidden when online

## How It Works

### When Offline

1. User performs an action (create trip, add expense, etc.)
2. Database operation fails due to no connectivity
3. `useOfflineStorage()` hook catches the error
4. Operation is queued to AsyncStorage via SyncQueue
5. UI shows success message: "Changes saved locally and will sync when online"
6. OfflineIndicator updates to show number of pending changes

### When Coming Back Online

1. NetworkContext detects reconnection
2. App automatically triggers `syncService.syncAllPendingOperations()`
3. SyncService processes queue items in order
4. For each operation:
   - Determines entity type and operation (create/update/delete)
   - Calls appropriate database function
   - Removes item from queue if successful
   - Keeps in queue if failed (for retry)
5. OfflineIndicator shows "Syncing X changes..." during sync
6. User is notified when all operations complete

## Usage Examples

### Using the useOfflineStorage Hook

```typescript
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

function MyComponent() {
  const { executeOrQueue, isOnline, queueSize } = useOfflineStorage();

  const handleCreateTrip = async (tripData) => {
    const result = await executeOrQueue(
      () => TripService.createTrip(tripData),
      {
        entityType: 'trip',
        operationType: 'create',
        data: tripData,
      }
    );

    if (result) {
      alert('Trip created successfully');
    } else if (!isOnline) {
      alert('Trip saved locally and will sync when online');
    }
  };

  return (
    <View>
      <Text>Queue size: {queueSize}</Text>
      <Button onPress={handleCreateTrip} title="Create Trip" />
    </View>
  );
}
```

### Manual Queue Management

```typescript
import syncQueueService from '@/services/syncQueue';

// Get queue size
const size = syncQueueService.getQueueSize();

// Get all operations
const operations = syncQueueService.getQueue();

// Clear queue (useful for testing)
syncQueueService.clearQueue();
```

### Monitoring Sync Status

```typescript
import { useNetwork } from '@/contexts/NetworkContext';
import syncService from '@/services/syncService';

function SyncMonitor() {
  const { isOnline } = useNetwork();
  const isSyncing = syncService.isSyncInProgress();

  return (
    <View>
      <Text>Online: {isOnline ? 'Yes' : 'No'}</Text>
      <Text>Syncing: {isSyncing ? 'Yes' : 'No'}</Text>
      <Text>Queue size: {syncService.getQueueSize()}</Text>
    </View>
  );
}
```

## Data Persistence

All data is stored locally using:
- **SQLite**: Native mobile platforms (iOS, Android)
- **IndexedDB**: Web platform

This ensures that:
- Users can access all their data offline
- No data is lost when offline
- Sync happens automatically when reconnected

## Error Handling

When an operation fails to sync:
1. It remains in the queue
2. Will be retried on next reconnection
3. User is notified if sync fails after multiple retries
4. Failed operations can be manually removed/cleared

## Configuration

Offline settings can be adjusted in `config/offlineConfig.ts`:
- `SYNC_RETRY_MAX_ATTEMPTS`: Number of retry attempts
- `SYNC_RETRY_DELAY_MS`: Delay between retries
- `SYNC_BATCH_SIZE`: Operations to process at once
- `OPERATION_TIMEOUT_MS`: Timeout per operation

## Testing Offline Functionality

### On Native Devices

1. Enable Airplane Mode to simulate offline
2. Perform an action (create trip, add expense)
3. Verify message appears: "Changes saved locally"
4. Check OfflineIndicator shows pending changes
5. Disable Airplane Mode to reconnect
6. Verify sync occurs automatically

### On Web (Browser DevTools)

1. Open DevTools → Network tab
2. Select "Offline" from throttling dropdown
3. Perform an action
4. Verify queue is populated
5. Return to "No throttling" to reconnect
6. Verify sync occurs

## Troubleshooting

### Changes not syncing after coming online

1. Check that `useNetwork()` is detecting connectivity correctly
2. Verify SyncService is initialized in app root
3. Check AsyncStorage for persisted queue: `localStorage['@travelbuddy:sync_queue']`
4. Review console logs for sync errors

### Queue growing indefinitely

1. Check if sync operations are failing silently
2. Verify database functions are working correctly
3. Check network status detection
4. Clear queue manually and retry: `syncQueueService.clearQueue()`

## Future Enhancements

- Push notifications when sync completes
- Conflict resolution when data is modified on server
- Selective sync (user chooses what to sync)
- Sync progress visualization
- Background sync API integration (Web)
- Service Worker for PWA support
