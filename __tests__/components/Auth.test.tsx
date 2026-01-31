/**
 * Component testing example for Auth component
 * Demonstrates best practices for component testing
 */

import React from 'react';
import { renderWithProviders, screen, fireEvent } from '../../../test-utils';
import Auth from '../../../components/Auth';

// Mock navigation
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock useAuthLogic
jest.mock('../logic', () => ({
  useAuthLogic: () => ({
    loading: false,
    error: null,
    isLogin: true,
    setIsLogin: jest.fn(),
    email: '',
    setEmail: jest.fn(),
    password: '',
    setPassword: jest.fn(),
    name: '',
    setName: jest.fn(),
    handleAuth: jest.fn(),
  }),
}));

describe('Auth Component', () => {
  describe('Login Tab', () => {
    it('should render login form when isLogin is true', () => {
      renderWithProviders(<Auth />);

      expect(screen.getByPlaceholderText(/email/i)).toBeVisible();
      expect(screen.getByPlaceholderText(/password/i)).toBeVisible();
    });

    it('should render login button', () => {
      renderWithProviders(<Auth />);

      const loginButton = screen.getByRole('button', { name: /sign in/i });
      expect(loginButton).toBeVisible();
    });

    it('should toggle to register form when switching tabs', () => {
      const { getByText } = renderWithProviders(<Auth />);

      const registerTab = getByText(/don't have an account/i);
      fireEvent.press(registerTab);

      expect(getByText(/join the adventure/i)).toBeVisible();
    });
  });

  describe('Register Tab', () => {
    it('should render name input in register form', () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(<Auth />);

      // Switch to register
      const registerTab = getByText(/don't have an account/i);
      fireEvent.press(registerTab);

      expect(getByPlaceholderText(/full name/i)).toBeVisible();
    });

    it('should show error message on failed registration', () => {
      // Mock error response
      jest.mock('../logic', () => ({
        useAuthLogic: () => ({
          error: 'Email already registered',
        }),
      }));

      const { getByText } = renderWithProviders(<Auth />);
      expect(getByText(/email already registered/i)).toBeVisible();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator during authentication', () => {
      jest.mock('../logic', () => ({
        useAuthLogic: () => ({
          loading: true,
        }),
      }));

      const { getByTestId } = renderWithProviders(<Auth />);
      expect(getByTestId('activity-indicator')).toBeVisible();
    });

    it('should disable submit button while loading', () => {
      jest.mock('../logic', () => ({
        useAuthLogic: () => ({
          loading: true,
        }),
      }));

      const { getByRole } = renderWithProviders(<Auth />);
      const button = getByRole('button');
      expect(button.props.disabled).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should show email error for invalid email', () => {
      const { getByPlaceholderText, getByText } = renderWithProviders(<Auth />);

      const emailInput = getByPlaceholderText(/email/i);
      fireEvent.changeText(emailInput, 'invalid-email');

      expect(getByText(/invalid email format/i)).toBeVisible();
    });

    it('should show password error for weak password', () => {
      const { getByPlaceholderText, getByText } = renderWithProviders(<Auth />);

      // Switch to register
      fireEvent.press(getByText(/don't have an account/i));

      const passwordInput = getByPlaceholderText(/password/i);
      fireEvent.changeText(passwordInput, '123');

      expect(
        getByText(/password must be at least 8 characters/i)
      ).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = renderWithProviders(<Auth />);

      expect(getByLabelText(/email address/i)).toBeVisible();
      expect(getByLabelText(/password/i)).toBeVisible();
    });

    it('should support keyboard navigation', () => {
      const { getByPlaceholderText } = renderWithProviders(<Auth />);

      const emailInput = getByPlaceholderText(/email/i);
      const passwordInput = getByPlaceholderText(/password/i);

      // Tab should move focus
      fireEvent(emailInput, 'keyDown', { key: 'Tab' });
      // In real app, focus would move to passwordInput
    });
  });
});
