# TravelBuddy Testing Guide

## Overview

TravelBuddy includes comprehensive testing coverage with unit tests, integration tests, and E2E tests to ensure quality and reliability across all features.

**Testing Coverage Target: >70%**

## Testing Stack

- **Unit Testing**: Jest + React Native Testing Library
- **Mocking**: jest-mock for database and external dependencies
- **Integration Testing**: Multi-step workflow testing with mocked services
- **E2E Testing**: Detox-compatible test syntax (adaptable to Maestro, Cypress)

## Setup

### 1. Install Testing Dependencies

```bash
npm install --save-dev \
  jest \
  jest-expo \
  @testing-library/react-native \
  @testing-library/jest-native \
  @types/jest
```

### 2. Project Structure

```
__tests__/
├── utils/              # Utility function tests
│   └── countries.test.ts
├── database/           # Database service tests
│   ├── profiles.test.ts
│   ├── buddies.test.ts
│   └── auth.test.ts
├── components/         # Component tests (add as needed)
├── integration/        # Workflow tests
│   ├── authentication.test.ts
│   ├── buddy-requests.test.ts
│   └── trip-management.test.ts
└── e2e/               # End-to-end tests
    └── critical-paths.e2e.ts
```

## Running Tests

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests for specific file
npm test -- profiles.test.ts

# Run tests with coverage report
npm test -- --coverage
```

### Integration Tests

```bash
# Run integration tests only
npm test -- --testPathPattern="integration"

# Run specific integration test
npm test -- integration/authentication.test.ts
```

### E2E Tests

```bash
# Setup Detox (if using Detox)
npm install --save-dev detox detox-cli

# Build E2E app
detox build-framework-cache
detox build-framework ios

# Run E2E tests
detox test __tests__/e2e/critical-paths.e2e.ts

# Alternative: Using Maestro
maestro test maestro/flows/
```

## Coverage Reports

### Generate Coverage Report

```bash
npm test -- --coverage --collectCoverageFrom="components/**/*.{ts,tsx},contexts/**/*.{ts,tsx},database/**/*.{ts,tsx},utils/**/*.{ts,tsx}" --coverageThreshold='{"global":{"branches":70,"functions":70,"lines":70,"statements":70}}'
```

### View HTML Coverage Report

```bash
npm test -- --coverage
# Open coverage/lcov-report/index.html in browser
```

### Coverage Thresholds

The project enforces minimum coverage thresholds:

- **Lines**: 70%
- **Statements**: 70%
- **Functions**: 70%
- **Branches**: 70%

## Test Types

### 1. Unit Tests

Test individual functions and components in isolation.

**Example: Countries Utility Test**

```typescript
describe('Countries Utility', () => {
  it('should return sorted array of countries', () => {
    const countries = getCountries();
    expect(countries.length).toBeGreaterThan(0);
    expect(countries[0].name <= countries[1].name).toBe(true);
  });
});
```

### 2. Integration Tests

Test complete workflows combining multiple services.

**Example: Authentication Flow**

```typescript
describe('Authentication Workflow', () => {
  it('should complete registration: create user -> create profile -> store token', async () => {
    // Step 1: Create user
    const user = await UserService.createUser(email, password);

    // Step 2: Create profile
    await ProfileService.createProfile(user.id, name);

    // Step 3: Store token
    await AsyncStorage.setItem('@auth_token', token);

    // Verify all steps
    expect(user.id).toBeDefined();
  });
});
```

### 3. E2E Tests

Test complete user journeys through the app UI.

**Example: Buddy Connection Flow**

```typescript
describe('E2E: Buddy Connection', () => {
  it('should find and send buddy request', async () => {
    // Navigate to Explore
    await element(by.id('explore-tab')).multiTap();

    // Find traveler and send request
    await element(by.id('traveler-card-0')).multiTap();
    await element(by.id('send-request-button')).multiTap();

    // Verify success
    await expect(element(by.text('Request sent!'))).toBeVisible();
  });
});
```

## Key Test Scenarios

### Authentication

- [x] User registration with validation
- [x] User login with credentials
- [x] Session persistence
- [x] Logout flow
- [x] Password strength validation
- [x] Email format validation

### Buddy Requests

- [x] Send buddy request
- [x] Accept buddy request
- [x] Reject buddy request
- [x] View received requests
- [x] View sent requests
- [x] View accepted buddies
- [x] Retrieve buddy list with profiles

### Trip Management

- [x] Create trip
- [x] Update trip details
- [x] Add itinerary items
- [x] Retrieve user trips
- [x] Delete trip
- [x] Delete associated itinerary

### Chat

- [x] Send messages
- [x] Receive messages
- [x] View conversations
- [x] Create new conversation

### Profile

- [x] Fetch user profile
- [x] Update profile information
- [x] Add travel interests
- [x] Remove travel interests
- [x] Upload profile picture

## Testing Best Practices

### 1. Use Test Utilities

Use the provided `renderWithProviders` function to render components with necessary context:

```typescript
import { renderWithProviders, screen } from '../test-utils';

test('component renders', () => {
  renderWithProviders(<MyComponent />);
  expect(screen.getByText('expected text')).toBeVisible();
});
```

### 2. Mock External Dependencies

Mock services and external APIs to isolate tests:

```typescript
jest.mock('../../database/profiles', () => ({
  getProfile: jest.fn(() =>
    Promise.resolve({ id: '123', name: 'John' })
  ),
}));
```

### 3. Test Behavior, Not Implementation

Focus on what the component does, not how it does it:

```typescript
// Good: Tests behavior
expect(screen.getByText('Request sent!')).toBeVisible();

// Avoid: Tests implementation details
expect(component.state.isLoading).toBe(false);
```

### 4. Use Meaningful Test Descriptions

```typescript
// Good
it('should accept buddy request and update UI with success message', () => {});

// Avoid
it('should work', () => {});
```

### 5. Keep Tests Isolated

Each test should be independent:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - run: npm test -- --testPathPattern="integration"
```

## Debugging Tests

### Run Single Test File

```bash
npm test -- __tests__/utils/countries.test.ts
```

### Run Tests Matching Pattern

```bash
npm test -- --testNamePattern="should authenticate"
```

### Debug Mode

```bash
node --inspect-brk node_modules/.bin/jest __tests__/utils/countries.test.ts
```

Then open `chrome://inspect` in Chrome DevTools.

## Troubleshooting

### Tests Failing with Module Not Found

```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### AsyncStorage Mock Not Working

Ensure AsyncStorage is mocked in `jest.setup.js`:

```typescript
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));
```

### Database Tests Failing

Verify database mocks are set up correctly:

```typescript
jest.mock('../../database/init', () => ({
  getDatabase: jest.fn(() =>
    Promise.resolve({
      runAsync: jest.fn(),
      getFirstAsync: jest.fn(),
    })
  ),
}));
```

## Contributing Tests

When adding new features:

1. Write tests first (TDD approach recommended)
2. Implement feature
3. Ensure tests pass
4. Maintain >70% coverage
5. Add integration test for complex workflows

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://testing-library.com/docs/react-native-testing-library/intro)
- [Detox E2E Testing](https://wix.github.io/Detox/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Coverage Goals

- **Auth Context**: 85%
- **Database Services**: 80%
- **Components**: 75%
- **Utils**: 90%
- **Overall**: >70%

## Maintenance

Review test coverage quarterly and update tests as features evolve. Keep mocks aligned with actual service implementations.
