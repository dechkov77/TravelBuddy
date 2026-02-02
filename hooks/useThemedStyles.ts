import { useTheme } from '@/contexts/ThemeContext';
import { StyleSheet } from 'react-native';
import { Theme } from '@/config/theme';
export function useThemedStyles(styleFactory: (theme: Theme) => ReturnType<typeof StyleSheet.create>) {
  const { theme } = useTheme();
  return styleFactory(theme);
}
export function createThemedStylesFactory(styleFactory: (theme: Theme) => ReturnType<typeof StyleSheet.create>) {
  return styleFactory;
}