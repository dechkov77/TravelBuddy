import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add custom options here if needed
}

/**
 * Custom render function that wraps components with necessary providers
 * Usage: const { getByText } = renderWithProviders(<MyComponent />);
 */
export const renderWithProviders = (
  component: React.ReactElement,
  options?: CustomRenderOptions
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );

  return render(component, { wrapper: Wrapper, ...options });
};

export * from '@testing-library/react-native';
