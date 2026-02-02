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
  async initialize(): Promise<void> {
    if (this.isLoaded) return;
    try {
      const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      this.queue = data ? JSON.parse(data) : [];
      this.isLoaded = true;
    } catch (error) {
      this.queue = [];
      this.isLoaded = true;
    }
  }
  addToQueue(operation: QueuedOperation): void {
    try {
      this.queue.push(operation);
      this.persistQueue();
    } catch (error) {
    }
  }
  getQueue(): QueuedOperation[] {
    return [...this.queue];
  }
  removeFromQueue(itemId: string): void {
    try {
      const initialLength = this.queue.length;
      this.queue = this.queue.filter(item => item.id !== itemId);
      if (this.queue.length < initialLength) {
        this.persistQueue();
      }
    } catch (error) {
    }
  }
  clearQueue(): void {
    try {
      this.queue = [];
      this.persistQueue();
    } catch (error) {
    }
  }
  getQueueSize(): number {
    return this.queue.length;
  }
  getOperationsByType(entityType: string): QueuedOperation[] {
    return this.queue.filter(op => op.entityType === entityType);
  }
  private async persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
    }
  }
}
const syncQueueService = new SyncQueueService();
export const syncQueueServiceAsync = {
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
  getQueue: async (): Promise<QueuedOperation[]> => {
    await syncQueueService.initialize();
    return syncQueueService.getQueue();
  },
  removeFromQueue: async (itemId: string): Promise<void> => {
    await syncQueueService.initialize();
    syncQueueService.removeFromQueue(itemId);
  },
  clearQueue: async (): Promise<void> => {
    await syncQueueService.initialize();
    syncQueueService.clearQueue();
  },
  getQueueSize: async (): Promise<number> => {
    await syncQueueService.initialize();
    return syncQueueService.getQueueSize();
  },
};
export default syncQueueService;