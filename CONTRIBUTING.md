# CONTRIBUTING.md

## Contributing to TravelBuddy

Thank you for your interest in contributing to TravelBuddy! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Welcome all skill levels
- Focus on constructive feedback
- Report issues responsibly

## Getting Started

### 1. Set Up Development Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/travelbuddy.git
cd TravelBuddy

# Install dependencies
npm install

# Install development tools
npm install --save-dev jest jest-expo @testing-library/react-native @types/jest

# Verify setup
npm start
```

### 2. Create a Feature Branch

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Or bugfix branch
git checkout -b bugfix/issue-description
```

**Naming conventions:**
- Features: `feature/descriptive-name`
- Bugs: `bugfix/bug-description`
- Docs: `docs/documentation-update`
- Tests: `test/test-description`

## Development Workflow

### 1. Write Tests First (TDD)

```typescript
// __tests__/utils/yourutil.test.ts
describe('Your Feature', () => {
  it('should do something specific', () => {
    const result = yourFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### 2. Implement Feature

```typescript
// utils/yourutil.ts
/**
 * Brief description of what the function does
 * @param {string} input - Description of parameter
 * @returns {string} Description of return value
 */
export const yourFunction = (input: string): string => {
  // Implementation
  return input;
};
```

### 3. Document Your Code

Add JSDoc comments to all public functions:

```typescript
/**
 * Validates email format
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 * @throws {Error} If email is not a string
 * 
 * @example
 * const isValid = validateEmail('user@example.com');
 * console.log(isValid); // true
 */
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- utils/yourutil.test.ts

# Check coverage
npm test -- --coverage
```

### 5. Lint Your Code

```bash
# Run ESLint
npm run lint

# Fix fixable issues
npm run lint -- --fix
```

### 6. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add user search functionality

- Add search input to Explore component
- Implement search algorithm in utils
- Add unit tests for search function
- Coverage now at 75%"
```

**Commit message format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation update
- `test:` - Test addition/modification
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `style:` - Code style changes

### 7. Push and Create Pull Request

```bash
# Push to remote
git push origin feature/your-feature-name

# Go to GitHub and create Pull Request
```

**PR Template:**

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Changes
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots
Add screenshots if UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass (npm test)
- [ ] Coverage maintained (>70%)
- [ ] Documentation updated
- [ ] No console errors/warnings
```

## Code Style Guide

### TypeScript

```typescript
// Use explicit types
const user: User = {
  id: 'user-123',
  name: 'John',
};

// Use interfaces for objects
interface User {
  id: string;
  name: string;
  email: string;
}

// Use enums for constants
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}
```

### React Components

```typescript
/**
 * User profile card component
 * 
 * @component
 * @example
 * return <UserCard userId="123" onPress={() => navigate('profile')} />
 */
interface UserCardProps {
  userId: string;
  onPress?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ userId, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      {/* Component JSX */}
    </TouchableOpacity>
  );
};

export default React.memo(UserCard);
```

### Naming Conventions

- **Constants**: `UPPER_SNAKE_CASE`
  ```typescript
  const MAX_ATTEMPTS = 3;
  const API_TIMEOUT = 30000;
  ```

- **Functions**: `camelCase`
  ```typescript
  const getUserProfile = async (userId: string) => {};
  const handleButtonPress = () => {};
  ```

- **Classes/Interfaces**: `PascalCase`
  ```typescript
  class UserService {}
  interface UserProfile {}
  ```

- **Files**: `kebab-case.ts` for utilities, `PascalCase.tsx` for components
  ```
  utils/
    user-validation.ts
    email-utils.ts
  components/
    UserCard.tsx
    BuddyRequest.tsx
  ```

## Testing Guidelines

### Unit Tests

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = yourFunction(input);

    // Assert
    expect(result).toBe('expected');
  });

  it('should handle errors', () => {
    expect(() => yourFunction(null)).toThrow();
  });
});
```

### Integration Tests

```typescript
describe('Auth Workflow', () => {
  it('should complete registration flow', async () => {
    // Step 1: Register
    const user = await registerUser(email, password);

    // Step 2: Create profile
    await createProfile(user.id, name);

    // Step 3: Verify
    expect(user.id).toBeDefined();
  });
});
```

### Coverage Requirements

- **Overall**: >70%
- **Critical paths**: >85%
- **Utilities**: >90%
- **Components**: >75%

## Documentation Standards

### JSDoc Format

```typescript
/**
 * Brief one-line description
 * 
 * More detailed description if needed.
 * Can span multiple lines.
 * 
 * @param {type} name - Parameter description
 * @param {type} [optional] - Optional parameter
 * @returns {type} Return value description
 * @throws {ErrorType} When this error is thrown
 * @deprecated Use newFunction instead
 * @see {@link relatedFunction}
 * 
 * @example
 * const result = myFunction('input');
 * console.log(result); // output
 */
```

### README Section for New Features

```markdown
### Feature Name

Brief description of what it does.

**Location**: `components/Feature/`

**Usage**:
\`\`\`typescript
import { Feature } from './components/Feature';

<Feature prop1="value" onEvent={() => {}} />
\`\`\`

**Props**:
- `prop1` (string): Description
- `onEvent` (Function): Callback description

**Example**:
...
```

## Common Issues and Solutions

### Tests Failing

```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules
npm install

# Run tests with verbose output
npm test -- --verbose
```

### Module Not Found

```bash
# Check import paths
# Make sure path matches file location

# Example:
// ✓ Correct
import { useTheme } from '../../contexts/ThemeContext';

// ✗ Wrong
import { useTheme } from '../../context/ThemeContext';
```

### TypeScript Errors

```bash
# Type check
npx tsc --noEmit

# Fix common issues
# - Ensure all imported modules are typed
# - Check function parameter types
# - Verify interface implementations
```

## Performance Considerations

### Optimize Components

```typescript
// Use React.memo for expensive renders
export default React.memo(MyComponent);

// Use useCallback for event handlers
const handlePress = useCallback(() => {
  // Handler code
}, [dependencies]);

// Use useMemo for expensive computations
const sortedList = useMemo(() => {
  return list.sort();
}, [list]);
```

### Optimize Database Queries

```typescript
// Good: Specific query
const users = await getUsersByCountry('USA');

// Avoid: Fetch all and filter
const allUsers = await getAllUsers();
const filtered = allUsers.filter(u => u.country === 'USA');
```

## Security Guidelines

- **Never commit secrets** - Use environment variables
- **Validate all inputs** - Use Zod schemas
- **Hash passwords** - Use bcrypt or similar
- **Sanitize data** - Prevent injection attacks
- **Use HTTPS** - For all network requests
- **Implement rate limiting** - Prevent abuse

## Git Workflow

```bash
# Update main branch
git fetch origin
git merge origin/main

# Rebase your branch (keep history clean)
git rebase main

# Force push only if you're the only one working on the branch
git push origin feature/your-feature-name -f
```

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release branch: `git checkout -b release/v1.0.0`
4. Update version-specific files
5. Create Pull Request
6. After merge, tag release: `git tag v1.0.0`
7. Push tag: `git push origin v1.0.0`

## Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-native-testing-library/intro)

## Questions?

- Check existing issues/discussions
- Read documentation files
- Ask in Pull Request comments
- Open a Discussion on GitHub

## Recognition

Contributors are recognized in:
- CONTRIBUTORS.md file
- GitHub contributors page
- Release notes

Thank you for contributing! 🎉
