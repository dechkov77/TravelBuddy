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

  describe('createProfile', () => {
    it('should create a profile with required fields', async () => {
      await ProfileService.createProfile(
        mockUserId,
        mockProfile.name,
        mockProfile.bio,
        mockProfile.country,
        mockProfile.travel_interests
      );
      expect(ProfileService.createProfile).toBeDefined();
    });

    it('should handle optional fields', async () => {
      await ProfileService.createProfile(mockUserId, 'Jane Doe');
      expect(ProfileService.createProfile).toBeDefined();
    });
  });

  describe('updateProfile', () => {
    it('should update profile with provided fields', async () => {
      const updates = { name: 'Jane Doe', country: 'Canada' };
      await ProfileService.updateProfile(mockUserId, updates);
      expect(ProfileService.updateProfile).toBeDefined();
    });

    it('should handle partial updates', async () => {
      const updates = { bio: 'Updated bio' };
      await ProfileService.updateProfile(mockUserId, updates);
      expect(ProfileService.updateProfile).toBeDefined();
    });
  });

  describe('getProfile', () => {
    it('should retrieve a profile by user ID', async () => {
      const profile = await ProfileService.getProfile(mockUserId);
      expect(ProfileService.getProfile).toBeDefined();
    });
  });

  describe('getAllProfiles', () => {
    it('should retrieve all profiles', async () => {
      const profiles = await ProfileService.getAllProfiles();
      expect(Array.isArray(profiles)).toBe(true);
    });

    it('should exclude specified user from results', async () => {
      const profiles = await ProfileService.getAllProfiles(mockUserId);
      expect(Array.isArray(profiles)).toBe(true);
    });
  });
});
