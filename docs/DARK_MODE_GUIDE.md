# Dark Mode Implementation Guide

This guide explains how dark mode is implemented in TravelBuddy and how to apply it to other components.

## Architecture

### Theme System
- **ThemeContext** (`contexts/ThemeContext.tsx`): Manages theme state and provides `useTheme()` hook
- **Theme Config** (`config/theme.ts`): Defines color palettes for light and dark modes
- **ThemeProvider**: Wraps the app in `app/_layout.tsx` to provide theme to all components

### Theme Colors

The theme object includes:
- **Primary colors**: `primary`, `primaryDark`, `secondary`, `accent`
- **Backgrounds**: `background`, `surface`, `card`, `modal`
- **Text colors**: `text`, `textSecondary`, `textLight`, `textInverse`
- **Status colors**: `success`, `warning`, `error`, `info`
- **Component colors**: `border`, `divider`, `disabled`, `placeholder`
- **Button colors**: `buttonPrimary`, `buttonSecondary`, `buttonText`
- **Input colors**: `inputBackground`, `inputBorder`, `inputText`
- **Navigation colors**: `navBackground`, `navBorder`, `navIcon`, `navIconActive`

## How to Add Dark Mode to Components

### Step 1: Import Theme
```typescript
import { useTheme } from '@/contexts/ThemeContext';
```

### Step 2: Get Theme in Component
```typescript
const { theme, toggleTheme, themeMode } = useTheme();
```

### Step 3: Update Styles

#### For Container/Background:
```typescript
<View style={[styles.container, { backgroundColor: theme.background }]}>
```

#### For Cards/Surfaces:
```typescript
<View style={[styles.card, { backgroundColor: theme.surface }]}>
```

#### For Text:
```typescript
<Text style={[styles.title, { color: theme.text }]}>Title</Text>
<Text style={[styles.subtitle, { color: theme.textSecondary }]}>Subtitle</Text>
```

#### For Inputs:
```typescript
<TextInput
  style={[styles.input, { 
    borderColor: theme.inputBorder, 
    backgroundColor: theme.inputBackground, 
    color: theme.inputText 
  }]}
  placeholderTextColor={theme.placeholder}
/>
```

#### For Buttons:
```typescript
<TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]}>
  <Text style={{ color: theme.buttonText }}>Click Me</Text>
</TouchableOpacity>
```

#### For Icons:
```typescript
<Ionicons name="star" size={24} color={theme.primary} />
```

### Step 4: Update Styles File

Remove hardcoded colors from StyleSheet:
```typescript
// ❌ Before
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
  },
  text: {
    color: '#333333',
  },
});

// ✅ After
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor removed - apply dynamically
  },
  text: {
    fontSize: 16,
    // color removed - apply dynamically
  },
});
```

## Theme Toggle Button

Add a theme toggle button to your component:

```typescript
<TouchableOpacity
  style={[styles.themeButton, { backgroundColor: theme.card }]}
  onPress={toggleTheme}
>
  <Ionicons
    name={themeMode === 'dark' ? 'sunny' : 'moon'}
    size={20}
    color={theme.primary}
  />
</TouchableOpacity>
```

## Example: Converting Auth Component

### Before (No Dark Mode)
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
  },
  card: {
    backgroundColor: '#FFFFFF',
  },
  title: {
    color: '#333333',
  },
  input: {
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
});
```

### After (With Dark Mode)
```typescript
import { useTheme } from '@/contexts/ThemeContext';

function Auth() {
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>Welcome</Text>
        <TextInput
          style={[styles.input, {
            borderColor: theme.inputBorder,
            backgroundColor: theme.inputBackground,
            color: theme.inputText,
          }]}
          placeholderTextColor={theme.placeholder}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 8,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
});
```

## Components Already Converted

- ✅ Profile (with theme toggle button)

## Components to Convert

- Auth
- Home
- Explore
- Feed
- Trips
- Buddies
- Chat
- PublicProfile
- TripDetail
- Navbar
- OfflineIndicator

## Persistent Theme

The user's theme preference is automatically saved to AsyncStorage and restored when the app restarts.

Key: `@travelbuddy:theme_mode`

## Color Palette Reference

### Light Mode
- Background: #F5F5F5
- Surface: #FFFFFF
- Primary: #4A90E2
- Text: #333333
- Text Secondary: #666666

### Dark Mode
- Background: #121212
- Surface: #1E1E1E
- Primary: #5BA3F5
- Text: #FFFFFF
- Text Secondary: #B0B0B0

## Testing Dark Mode

1. Toggle theme from Profile screen
2. Verify all text is readable
3. Verify all buttons are visible
4. Verify all inputs are functional
5. Check color contrast ratios meet accessibility standards
6. Restart app and verify theme is remembered

## Accessibility Notes

- Ensure sufficient contrast between text and background
- Light mode: Minimum contrast ratio of 4.5:1 for normal text
- Dark mode: Minimum contrast ratio of 4.5:1 for normal text
- Use `theme.textLight` for secondary text (may need higher opacity)
- Test with accessibility checker tools

## Performance Considerations

- Theme changes are re-rendered only in components using `useTheme()`
- StyleSheets with theme values create new objects on each render
- Consider memoization for complex components:

```typescript
import { useMemo } from 'react';

function MyComponent() {
  const { theme } = useTheme();
  
  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
  }), [theme]);

  return <View style={dynamicStyles.container} />;
}
```
