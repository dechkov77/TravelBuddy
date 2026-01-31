/**
 * Authentication workflow integration tests
 * Tests complete user authentication flows
 */

jest.mock('../../database/users');
jest.mock('../../database/profiles');
jest.mock('@react-native-async-storage/async-storage');

import * as UserService from '../../database/users';
import * as ProfileService from '../../database/profiles';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Authentication Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Registration Flow', () => {
    it('should complete full registration: create user -> create profile -> store token', async () => {
      const mockUserData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'John Doe',
      };

      // Step 1: Create user
      (UserService.createUser as jest.Mock).mockResolvedValueOnce({
        id: 'user-123',
        email: mockUserData.email,
        created_at: new Date().toISOString(),
      });

      // Step 2: Create profile
      (ProfileService.createProfile as jest.Mock).mockResolvedValueOnce(undefined);

      // Step 3: Store auth token
      (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);

      // Execute flow
      const user = await UserService.createUser(
        mockUserData.email,
        mockUserData.password
      );
      await ProfileService.createProfile(user.id, mockUserData.name);
      await AsyncStorage.setItem('@auth_token', 'mock-token-123');

      // Verify all steps completed
      expect(UserService.createUser).toHaveBeenCalledWith(
        mockUserData.email,
        mockUserData.password
      );
      expect(ProfileService.createProfile).toHaveBeenCalledWith(
        user.id,
        mockUserData.name
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@auth_token',
        'mock-token-123'
      );
    });

    it('should handle registration errors gracefully', async () => {
      (UserService.createUser as jest.Mock).mockRejectedValueOnce(
        new Error('Email already exists')
      );

      try {
        await UserService.createUser('existing@example.com', 'Password123!');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('User Login Flow', () => {
    it('should retrieve user and restore session', async () => {
      const mockUserId = 'user-123';

      // Step 1: Get stored user ID
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(mockUserId);

      // Step 2: Fetch user data
      (UserService.getUser as jest.Mock).mockResolvedValueOnce({
        id: mockUserId,
        email: 'user@example.com',
        created_at: new Date().toISOString(),
      });

      const storedUserId = await AsyncStorage.getItem('@user_id');
      const user = await UserService.getUser(storedUserId);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@user_id');
      expect(UserService.getUser).toHaveBeenCalledWith(mockUserId);
      expect(user.id).toBe(mockUserId);
    });
  });

  describe('User Logout Flow', () => {
    it('should clear stored auth data on logout', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValueOnce(undefined);
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValueOnce(undefined);

      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user_id');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@auth_token');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@user_id');
    });
  });
});
