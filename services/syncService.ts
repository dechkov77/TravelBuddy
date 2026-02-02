import * as TripDB from '@/database/trips';
import * as ExpenseDB from '@/database/expenses';
import * as ItineraryDB from '@/database/itinerary';
import * as JournalDB from '@/database/journal';
import * as RecommendationDB from '@/database/recommendations';
import syncQueueService from './syncQueue';
export interface SyncableOperation {
  id: string;
  entityType: 'trip' | 'expense' | 'itinerary' | 'journal' | 'recommendation';
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}
class SyncService {
  private isSyncing = false;
  async syncAllPendingOperations(): Promise<{ success: boolean; syncedCount: number; failedCount: number }> {
    if (this.isSyncing) {
      return { success: false, syncedCount: 0, failedCount: 0 };
    }
    this.isSyncing = true;
    let syncedCount = 0;
    let failedCount = 0;
    try {
      const queue = syncQueueService.getQueue();
      for (const operation of queue) {
        try {
          await this.processOperation(operation);
          syncQueueService.removeFromQueue(operation.id);
          syncedCount++;
        } catch (error) {
          failedCount++;
        }
      }
      return {
        success: failedCount === 0,
        syncedCount,
        failedCount,
      };
    } finally {
      this.isSyncing = false;
    }
  }
  private async processOperation(operation: SyncableOperation): Promise<void> {
    switch (operation.entityType) {
      case 'trip':
        await this.syncTrip(operation);
        break;
      case 'expense':
        await this.syncExpense(operation);
        break;
      case 'itinerary':
        await this.syncItinerary(operation);
        break;
      case 'journal':
        await this.syncJournal(operation);
        break;
      case 'recommendation':
        await this.syncRecommendation(operation);
        break;
      default:
        throw new Error(`Unknown entity type: ${(operation as any).entityType}`);
    }
  }
  private async syncTrip(operation: SyncableOperation): Promise<void> {
    switch (operation.operation) {
      case 'create':
        await TripDB.createTrip(
          operation.data.id,
          operation.data.user_id,
          operation.data.destination,
          operation.data.start_date,
          operation.data.end_date,
          operation.data.description
        );
        break;
      case 'update':
        await TripDB.updateTrip(operation.data.id, operation.data);
        break;
      case 'delete':
        await TripDB.deleteTrip(operation.data.id);
        break;
    }
  }
  private async syncExpense(operation: SyncableOperation): Promise<void> {
    switch (operation.operation) {
      case 'create':
        await ExpenseDB.createExpense(
          operation.data.id,
          operation.data.trip_id,
          operation.data.user_id,
          operation.data.title,
          operation.data.amount,
          operation.data.category,
          operation.data.description,
          operation.data.split_among
        );
        break;
      case 'update':
        await ExpenseDB.updateExpense(operation.data.id, operation.data);
        break;
      case 'delete':
        await ExpenseDB.deleteExpense(operation.data.id);
        break;
    }
  }
  private async syncItinerary(operation: SyncableOperation): Promise<void> {
    switch (operation.operation) {
      case 'create':
        await ItineraryDB.createItineraryItem(
          operation.data.id,
          operation.data.trip_id,
          operation.data.activity,
          operation.data.date,
          operation.data.time,
          operation.data.location,
          operation.data.notes
        );
        break;
      case 'update':
        await ItineraryDB.updateItineraryItem(operation.data.id, operation.data);
        break;
      case 'delete':
        await ItineraryDB.deleteItineraryItem(operation.data.id);
        break;
    }
  }
  private async syncJournal(operation: SyncableOperation): Promise<void> {
    switch (operation.operation) {
      case 'create':
        await JournalDB.createJournalEntry(
          operation.data.id,
          operation.data.trip_id,
          operation.data.user_id,
          operation.data.title,
          operation.data.content,
          operation.data.date,
          operation.data.photos,
          operation.data.location
        );
        break;
      case 'update':
        await JournalDB.updateJournalEntry(operation.data.id, operation.data);
        break;
      case 'delete':
        await JournalDB.deleteJournalEntry(operation.data.id);
        break;
    }
  }
  private async syncRecommendation(operation: SyncableOperation): Promise<void> {
    switch (operation.operation) {
      case 'create':
        await RecommendationDB.createRecommendation(
          operation.data.id,
          operation.data.trip_id,
          operation.data.user_id,
          operation.data.place,
          operation.data.description,
          operation.data.category
        );
        break;
      case 'update':
        await RecommendationDB.updateRecommendation(operation.data.id, operation.data);
        break;
      case 'delete':
        await RecommendationDB.deleteRecommendation(operation.data.id);
        break;
    }
  }
  getQueueSize(): number {
    return syncQueueService.getQueueSize();
  }
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}
export default new SyncService();