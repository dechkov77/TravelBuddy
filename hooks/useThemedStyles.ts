import { useTheme } from '@/contexts/ThemeContext';
import { StyleSheet } from 'react-native';
import { Theme } from '@/config/theme';

/**
 * Hook to create theme-aware styles
 * Usage: const themedStyles = useThemedStyles(createStyles);
 */
export function useThemedStyles(styleFactory: (theme: Theme) => ReturnType<typeof StyleSheet.create>) {
  const { theme } = useTheme();
  return styleFactory(theme);
}

/**
 * Create a function that generates themed styles
 * This pattern allows styles to be recomputed when theme changes
 */
export function createThemedStylesFactory(styleFactory: (theme: Theme) => ReturnType<typeof StyleSheet.create>) {
  return styleFactory;
}
