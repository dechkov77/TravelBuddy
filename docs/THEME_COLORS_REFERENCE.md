# Theme Color Reference

## Complete Color Palettes

### Light Mode Theme Colors

```
Primary Colors:
- primary: #4A90E2 (Main blue)
- primaryDark: #3A7BC8 (Darker blue)
- secondary: #7B68EE (Purple)
- accent: #FF6B9D (Pink)

Backgrounds:
- background: #F5F5F5 (Page background)
- surface: #FFFFFF (Cards, modals)
- card: #FFFFFF (Nested cards)
- modal: #F9F9F9 (Modal background)

Text Colors:
- text: #333333 (Primary text)
- textSecondary: #666666 (Secondary text)
- textLight: #999999 (Light text/hints)
- textInverse: #FFFFFF (Text on dark backgrounds)

Status Colors:
- success: #4CAF50 (Green for success)
- warning: #FFC107 (Orange for warnings)
- error: #E74C3C (Red for errors)
- info: #2196F3 (Blue for info)

Component Colors:
- border: #EEEEEE (Border color)
- divider: #E0E0E0 (Divider lines)
- disabled: #CCCCCC (Disabled state)
- placeholder: #999999 (Placeholder text)

Button Colors:
- buttonPrimary: #4A90E2 (Primary button)
- buttonSecondary: #F0F0F0 (Secondary button)
- buttonText: #FFFFFF (Button text)

Input Colors:
- inputBackground: #F0F0F0 (Input background)
- inputBorder: #DDDDDD (Input border)
- inputText: #333333 (Input text)

Navigation Colors:
- navBackground: #FFFFFF (Nav bar background)
- navBorder: #EEEEEE (Nav bar border)
- navIcon: #666666 (Nav icons)
- navIconActive: #4A90E2 (Active nav icon)

Overlay:
- overlay: rgba(0, 0, 0, 0.5) (Dark overlay)
- overlayLight: rgba(0, 0, 0, 0.3) (Light overlay)
```

### Dark Mode Theme Colors

```
Primary Colors:
- primary: #5BA3F5 (Lighter blue for dark mode)
- primaryDark: #4A90E2 (Standard blue)
- secondary: #9B88FF (Lighter purple)
- accent: #FF85B3 (Lighter pink)

Backgrounds:
- background: #121212 (Page background - pure black)
- surface: #1E1E1E (Cards - dark gray)
- card: #2A2A2A (Nested cards - darker gray)
- modal: #252525 (Modal background)

Text Colors:
- text: #FFFFFF (Primary text - white)
- textSecondary: #B0B0B0 (Secondary text - light gray)
- textLight: #777777 (Light text/hints - medium gray)
- textInverse: #333333 (Text on light backgrounds)

Status Colors:
- success: #66BB6A (Lighter green)
- warning: #FFD54F (Lighter yellow)
- error: #EF5350 (Lighter red)
- info: #42A5F5 (Lighter blue)

Component Colors:
- border: #333333 (Border color - dark gray)
- divider: #404040 (Divider lines - darker gray)
- disabled: #555555 (Disabled state - medium gray)
- placeholder: #666666 (Placeholder text - gray)

Button Colors:
- buttonPrimary: #5BA3F5 (Primary button - light blue)
- buttonSecondary: #333333 (Secondary button - dark)
- buttonText: #FFFFFF (Button text - white)

Input Colors:
- inputBackground: #2A2A2A (Input background - dark gray)
- inputBorder: #404040 (Input border - darker gray)
- inputText: #FFFFFF (Input text - white)

Navigation Colors:
- navBackground: #1E1E1E (Nav bar background - dark)
- navBorder: #333333 (Nav bar border - darker)
- navIcon: #999999 (Nav icons - light gray)
- navIconActive: #5BA3F5 (Active nav icon - light blue)

Overlay:
- overlay: rgba(0, 0, 0, 0.7) (Very dark overlay)
- overlayLight: rgba(0, 0, 0, 0.5) (Dark overlay)
```

## Color Usage Guidelines

### Text
- Use `theme.text` for primary content text
- Use `theme.textSecondary` for labels and secondary information
- Use `theme.textLight` for hints, placeholders, and disabled text
- Use `theme.textInverse` when text appears on primary color backgrounds

### Backgrounds
- Use `theme.background` for page/screen backgrounds
- Use `theme.surface` for cards, dialogs, and content areas
- Use `theme.card` for nested components within surfaces
- Use `theme.modal` for modal overlay backgrounds

### Interactive Elements
- Use `theme.primary` for primary buttons and active states
- Use `theme.secondary` for secondary buttons and accents
- Use `theme.accent` for highlights and special focus areas
- Use `theme.success`, `theme.warning`, `theme.error` for status messages

### Inputs
- Use `theme.inputBackground` for input field backgrounds
- Use `theme.inputBorder` for input field borders
- Use `theme.inputText` for input field text
- Use `theme.placeholder` for placeholder text color

### Navigation
- Use `theme.navBackground` for navigation bar background
- Use `theme.navIcon` for inactive navigation icons
- Use `theme.navIconActive` for active/selected navigation icons
- Use `theme.navBorder` for navigation borders

## Accessibility Considerations

### Contrast Ratios (WCAG AA)
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components and borders: 3:1 minimum

### Color Combinations to Use
**Light Mode:**
- Dark text (#333) on light backgrounds (#FFF, #F5F5F5)
- Light text (#FFF) on dark backgrounds (#4A90E2, #0066CC)
- Icons use theme.primary on light backgrounds

**Dark Mode:**
- Light text (#FFF) on dark backgrounds (#1E1E1E, #121212)
- Dark text (#333) on light backgrounds (for accents)
- Icons use theme.primary on dark backgrounds

### Avoid These Combinations
- Low contrast text that is hard to read
- Color-only differentiation for important information
- Flashing content that changes too rapidly
- Very small text on colored backgrounds

## Using Specific Colors in Components

### Profile Card Example
```typescript
style={[
  styles.card, 
  { backgroundColor: theme.surface }
]}
```

### Input Field Example
```typescript
style={[
  styles.input, 
  { 
    borderColor: theme.inputBorder,
    backgroundColor: theme.inputBackground,
    color: theme.inputText
  }
]}
```

### Button Example
```typescript
style={[
  styles.button,
  { 
    backgroundColor: theme.primary
  }
]}
<Text style={{ color: theme.buttonText }}>Click</Text>
```

### Icon Example
```typescript
<Ionicons 
  name="star" 
  size={24} 
  color={currentScreen === 'feed' ? theme.primary : theme.navIcon} 
/>
```

### Disabled State Example
```typescript
<TouchableOpacity 
  disabled={isLoading}
  style={{
    backgroundColor: isLoading ? theme.disabled : theme.primary,
    opacity: isLoading ? 0.6 : 1
  }}
>
```

## Testing Colors

### Light Mode Testing
1. Verify all text is dark and readable on light backgrounds
2. Verify all background elements are appropriately lighter
3. Check that accent colors pop without being jarring
4. Ensure buttons and inputs are clearly distinguished

### Dark Mode Testing
1. Verify all text is light and readable on dark backgrounds
2. Verify background hierarchy (background < surface < card)
3. Check that icons and accents are visible and not too bright
4. Ensure no eye strain from excessive contrast

### Cross-Platform Testing
- Test on iOS and Android
- Test on various screen brightnesses
- Test with accessibility features enabled (high contrast, text size)
- Test with screen readers

## Color Picker Tool Integration

To integrate a color picker for theme customization:

1. Create colors from user selections
2. Store custom theme to AsyncStorage
3. Merge custom theme with defaults
4. Apply custom theme to ThemeContext

Example:
```typescript
const userTheme = {
  ...lightTheme,
  primary: '#FF5733', // User-selected color
  accent: '#33FF57'   // User-selected color
};
```

## Performance Tips

- Pre-compute theme colors if used frequently
- Use memoization for complex color transformations
- Cache theme object in context to avoid re-renders
- Use inline styles sparingly in large lists
- Consider extracting dynamic styles to separate hook

## Resources

- WCAG Color Contrast Checker: https://webaim.org/resources/contrastchecker/
- Color Accessibility: https://www.color-blindness.com/
- Material Design Dark Theme: https://material.io/design/color/dark-theme.html
- React Native theming best practices
