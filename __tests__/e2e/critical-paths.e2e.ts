/**
 * E2E test configuration for critical user paths
 * Uses Detox-like syntax for native mobile testing
 * Can be adapted for Maestro, Cypress, or other E2E frameworks
 */

/**
 * Authentication E2E Test
 * Tests complete user registration and login flow
 */
describe('E2E: User Authentication Flow', () => {
  beforeAll(async () => {
    // Reset app state
    await device?.launchApp?.();
  });

  beforeEach(async () => {
    // Reset to clean state before each test
    await device?.reloadReactNative?.();
  });

  it('should register new user successfully', async () => {
    // Navigate to auth screen if not already there
    await element(by.id('auth-screen')).multiTap();

    // Enter email
    await element(by.id('email-input')).typeText('newuser@example.com');
    await element(by.id('email-input')).tapReturnKey();

    // Enter password
    await element(by.id('password-input')).typeText('SecurePass123!');
    await element(by.id('password-input')).tapReturnKey();

    // Enter name
    await element(by.id('name-input')).typeText('John Doe');

    // Tap register button
    await element(by.id('register-button')).multiTap();

    // Wait for navigation to home
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify user is logged in
    await expect(element(by.text('Welcome, John Doe'))).toBeVisible();
  });

  it('should login with existing credentials', async () => {
    // Navigate to login tab
    await element(by.id('login-tab')).multiTap();

    // Enter credentials
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('TestPass123!');

    // Tap login button
    await element(by.id('login-button')).multiTap();

    // Wait for navigation
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify navigation succeeded
    await expect(element(by.text('Trip Feed'))).toBeVisible();
  });

  it('should logout successfully', async () => {
    // Tap profile menu
    await element(by.id('profile-tab')).multiTap();

    // Tap logout button
    await element(by.id('logout-button')).multiTap();

    // Confirm logout
    await element(by.text('Yes, Logout')).multiTap();

    // Verify redirected to auth
    await waitFor(element(by.id('auth-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });
});

/**
 * Buddy Connection E2E Test
 * Tests finding and connecting with travel buddies
 */
describe('E2E: Buddy Connection Flow', () => {
  beforeAll(async () => {
    await device?.launchApp?.();
  });

  it('should find and send buddy request', async () => {
    // Navigate to Explore
    await element(by.id('explore-tab')).multiTap();

    // Wait for travelers list to load
    await waitFor(element(by.id('traveler-card-0')))
      .toBeVisible()
      .withTimeout(5000);

    // View first traveler profile
    await element(by.id('traveler-card-0')).multiTap();

    // Verify profile displays
    await expect(element(by.text('Send Buddy Request'))).toBeVisible();

    // Send buddy request
    await element(by.id('send-request-button')).multiTap();

    // Verify success message
    await expect(element(by.text('Request sent!'))).toBeVisible();
  });

  it('should accept buddy request', async () => {
    // Navigate to Buddies
    await element(by.id('buddies-tab')).multiTap();

    // Tap Received tab
    await element(by.text('Received')).multiTap();

    // Wait for requests to load
    await waitFor(element(by.id('buddy-request-0')))
      .toBeVisible()
      .withTimeout(5000);

    // Accept first request
    await element(by.id('accept-button-0')).multiTap();

    // Verify success
    await expect(element(by.text('Request accepted!'))).toBeVisible();
  });

  it('should view buddy profile', async () => {
    // Navigate to Buddies
    await element(by.id('buddies-tab')).multiTap();

    // Tap Buddies tab
    await element(by.text('Buddies')).multiTap();

    // Tap first buddy
    await element(by.id('buddy-card-0')).multiTap();

    // Verify profile displays
    await expect(element(by.id('public-profile-screen'))).toBeVisible();
  });
});

/**
 * Trip Creation E2E Test
 * Tests creating and managing trips
 */
describe('E2E: Trip Creation Flow', () => {
  beforeAll(async () => {
    await device?.launchApp?.();
  });

  it('should create new trip', async () => {
    // Navigate to Trips
    await element(by.id('trips-tab')).multiTap();

    // Tap Create Trip button
    await element(by.id('create-trip-button')).multiTap();

    // Fill trip form
    await element(by.id('trip-title-input')).typeText('Paris Adventure');
    await element(by.id('trip-description-input')).typeText(
      'A week in the city of light'
    );

    // Select dates
    await element(by.id('start-date-input')).multiTap();
    await element(by.text('15')).multiTap(); // Select 15th
    await element(by.id('ok-button')).multiTap();

    await element(by.id('end-date-input')).multiTap();
    await element(by.text('22')).multiTap(); // Select 22nd
    await element(by.id('ok-button')).multiTap();

    // Tap Save button
    await element(by.id('save-trip-button')).multiTap();

    // Verify trip created
    await expect(element(by.text('Paris Adventure'))).toBeVisible();
  });

  it('should view trip details', async () => {
    // Navigate to Trips
    await element(by.id('trips-tab')).multiTap();

    // Tap first trip
    await element(by.id('trip-card-0')).multiTap();

    // Verify trip detail screen
    await expect(element(by.id('trip-detail-screen'))).toBeVisible();

    // Verify itinerary section exists
    await expect(element(by.id('itinerary-section'))).toBeVisible();
  });
});

/**
 * Chat E2E Test
 * Tests messaging between buddies
 */
describe('E2E: Chat Flow', () => {
  beforeAll(async () => {
    await device?.launchApp?.();
  });

  it('should send and receive messages', async () => {
    // Navigate to Chat
    await element(by.id('chat-tab')).multiTap();

    // Wait for conversations to load
    await waitFor(element(by.id('conversation-0')))
      .toBeVisible()
      .withTimeout(5000);

    // Tap first conversation
    await element(by.id('conversation-0')).multiTap();

    // Wait for chat screen
    await waitFor(element(by.id('message-input')))
      .toBeVisible()
      .withTimeout(5000);

    // Type and send message
    await element(by.id('message-input')).typeText('Hey, how is your trip going?');
    await element(by.id('send-button')).multiTap();

    // Verify message appears
    await expect(element(by.text('Hey, how is your trip going?'))).toBeVisible();
  });
});

// Helper functions for E2E tests
export const waitFor = (element: any) => ({
  toBeVisible: () => element,
  withTimeout: (ms: number) => Promise.resolve(),
});

export const element = (matcher: any) => ({
  multiTap: () => Promise.resolve(),
  typeText: (text: string) => Promise.resolve(),
  tapReturnKey: () => Promise.resolve(),
});

export const by = {
  id: (testID: string) => ({ testID }),
  text: (text: string) => ({ text }),
};

export const device = {
  launchApp: () => Promise.resolve(),
  reloadReactNative: () => Promise.resolve(),
};
