import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QueuedOperation {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entityType: 'trip' | 'expense' | 'itinerary' | 'journal' | 'recommendation';
  data: any;
  timestamp: number;
}

export interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entityType: string;
  entityId: string;
  data: any;
  timestamp: number;
}

const SYNC_QUEUE_KEY = '@travelbuddy:sync_queue';

class SyncQueueService {
  private queue: QueuedOperation[] = [];
  private isLoaded = false;

  /**
   * Initialize the sync queue from storage
   */
  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      this.queue = data ? JSON.parse(data) : [];
      this.isLoaded = true;
      console.log(`[SyncQueue] Initialized with ${this.queue.length} pending operations`);
    } catch (error) {
      console.error('[SyncQueue] Error initializing:', error);
      this.queue = [];
      this.isLoaded = true;
    }
  }

  /**
   * Add an operation to the sync queue
   */
  addToQueue(operation: QueuedOperation): void {
    try {
      this.queue.push(operation);
      this.persistQueue();
      console.log('[SyncQueue] Added operation:', operation.id);
    } catch (error) {
      console.error('[SyncQueue] Error adding to queue:', error);
    }
  }

  /**
   * Get all queued operations
   */
  getQueue(): QueuedOperation[] {
    return [...this.queue];
  }

  /**
   * Remove an item from the queue by ID
   */
  removeFromQueue(itemId: string): void {
    try {
      const initialLength = this.queue.length;
      this.queue = this.queue.filter(item => item.id !== itemId);

      if (this.queue.length < initialLength) {
        this.persistQueue();
        console.log('[SyncQueue] Removed item from queue:', itemId);
      }
    } catch (error) {
      console.error('[SyncQueue] Error removing from queue:', error);
    }
  }

  /**
   * Clear the entire sync queue
   */
  clearQueue(): void {
    try {
      this.queue = [];
      this.persistQueue();
      console.log('[SyncQueue] Queue cleared');
    } catch (error) {
      console.error('[SyncQueue] Error clearing queue:', error);
    }
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Get operations by entity type
   */
  getOperationsByType(entityType: string): QueuedOperation[] {
    return this.queue.filter(op => op.entityType === entityType);
  }

  /**
   * Persist queue to AsyncStorage
   */
  private async persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[SyncQueue] Error persisting queue:', error);
    }
  }
}

// Export singleton instance
const syncQueueService = new SyncQueueService();

// Async legacy interface for backwards compatibility
export const syncQueueServiceAsync = {
  /**
   * Add an operation to the sync queue
   */
  addToQueue: async (
    operation: 'create' | 'update' | 'delete',
    entityType: string,
    entityId: string,
    data: any
  ): Promise<void> => {
    await syncQueueService.initialize();
    const item: QueuedOperation = {
      id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
      operation,
      entityType: entityType as any,
      data: { ...data, entityId },
      timestamp: Date.now(),
    };
    syncQueueService.addToQueue(item);
  },

  /**
   * Get all queued operations
   */
  getQueue: async (): Promise<QueuedOperation[]> => {
    await syncQueueService.initialize();
    return syncQueueService.getQueue();
  },

  /**
   * Remove an item from the queue
   */
  removeFromQueue: async (itemId: string): Promise<void> => {
    await syncQueueService.initialize();
    syncQueueService.removeFromQueue(itemId);
  },

  /**
   * Clear the entire sync queue
   */
  clearQueue: async (): Promise<void> => {
    await syncQueueService.initialize();
    syncQueueService.clearQueue();
  },

  /**
   * Get queue size
   */
  getQueueSize: async (): Promise<number> => {
    await syncQueueService.initialize();
    return syncQueueService.getQueueSize();
  },
};

export default syncQueueService;
