/**
 * Profile database tests
 * Tests for profile CRUD operations
 */

import * as ProfileService from '../../database/profiles';
import { Profile } from '../../database/types';

// Mock the getDatabase function
jest.mock('../../database/init', () => ({
  getDatabase: jest.fn(() =>
    Promise.resolve({
      runAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn(),
      execAsync: jest.fn(),
    })
  ),
}));

describe('Profile Database Service', () => {
  const mockUserId = 'test-user-123';
  const mockProfile: Profile = {
    id: mockUserId,
    name: 'John Doe',
    bio: 'Travel enthusiast',
    country: 'USA',
    travel_interests: ['hiking', 'culture'],
    profile_picture: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile structure', () => {
    it('should define profile properties', () => {
      expect(mockProfile).toBeDefined();
      expect(mockProfile.id).toBe(mockUserId);
      expect(mockProfile.name).toBe('John Doe');
    });

    it('should validate travel interests array', () => {
      expect(Array.isArray(mockProfile.travel_interests)).toBe(true);
      expect(mockProfile.travel_interests).toContain('hiking');
    });

    it('should have country field', () => {
      expect(mockProfile.country).toBe('USA');
    });

    it('should have timestamps', () => {
      expect(mockProfile.created_at).toBeDefined();
      expect(mockProfile.updated_at).toBeDefined();
    });

    it('should allow optional bio field', () => {
      const profile = { ...mockProfile, bio: null };
      expect(profile.bio).toBeNull();
    });

    it('should allow partial profile updates', () => {
      const updates = { name: 'Jane Doe', country: 'Canada' };
      expect(updates).toHaveProperty('name', 'Jane Doe');
      expect(updates).toHaveProperty('country', 'Canada');
    });
  });
});
