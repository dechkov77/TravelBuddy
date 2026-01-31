import { useNetwork } from '@/contexts/NetworkContext';
import syncQueueService, { QueuedOperation } from '@/services/syncQueue';

type EntityType = 'trip' | 'expense' | 'itinerary' | 'journal' | 'recommendation';

export function useOfflineStorage() {
  const { isOnline } = useNetwork();

  /**
   * Wraps a database operation to handle offline scenarios
   * If offline, queues the operation instead of executing it
   */
  const executeOrQueue = async <T>(
    operation: () => Promise<T>,
    queueData: {
      entityType: EntityType;
      operationType: 'create' | 'update' | 'delete';
      data: any;
    }
  ): Promise<T | null> => {
    try {
      // Try to execute the operation
      return await operation();
    } catch (error: any) {
      // If offline or network error, queue the operation
      if (!isOnline || error.message?.includes('network') || error.message?.includes('offline')) {
        console.log(`Device offline. Queuing ${queueData.operationType} operation for ${queueData.entityType}`);

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

      // If it's a different error, throw it
      throw error;
    }
  };

  return {
    executeOrQueue,
    isOnline,
    queueSize: syncQueueService.getQueueSize(),
  };
}
