import { useNetwork } from '@/contexts/NetworkContext';
import syncQueueService, { QueuedOperation } from '@/services/syncQueue';
type EntityType = 'trip' | 'expense' | 'itinerary' | 'journal' | 'recommendation';
export function useOfflineStorage() {
  const { isOnline } = useNetwork();
  const executeOrQueue = async <T>(
    operation: () => Promise<T>,
    queueData: {
      entityType: EntityType;
      operationType: 'create' | 'update' | 'delete';
      data: any;
    }
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error: any) {
      if (!isOnline || error.message?.includes('network') || error.message?.includes('offline')) {
        const queuedOp: QueuedOperation = {
          id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
          entityType: queueData.entityType,
          operation: queueData.operationType,
          data: queueData.data,
          timestamp: Date.now(),
        };
        syncQueueService.addToQueue(queuedOp);
        return null;
      }
      throw error;
    }
  };
  return {
    executeOrQueue,
    isOnline,
    queueSize: syncQueueService.getQueueSize(),
  };
}