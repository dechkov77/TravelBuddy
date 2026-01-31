# API Documentation

## Overview

TravelBuddy provides a comprehensive set of services and APIs for managing users, profiles, buddies, trips, and communications.

## Authentication API

### Login

```typescript
const { user, profile, login, isLoading, error } = useAuth();

const handleLogin = async (email: string, password: string) => {
  const result = await login(email, password);
  if (result.success) {
    // User logged in successfully
  }
};
```

**Parameters:**
- `email` (string): User email address
- `password` (string): User password

**Returns:**
- `success` (boolean): Whether login was successful
- `error` (string|null): Error message if login failed

### Register

```typescript
const handleRegister = async (email: string, password: string, name: string) => {
  const result = await register(email, password, name);
  if (result.success) {
    // User registered successfully
  }
};
```

**Parameters:**
- `email` (string): User email address
- `password` (string): Minimum 8 characters, must include uppercase, lowercase, and number
- `name` (string): User's full name

**Returns:**
- `success` (boolean): Whether registration was successful
- `error` (string|null): Validation or registration error

### Logout

```typescript
const handleLogout = async () => {
  await logout();
  // User logged out, redirected to auth screen
};
```

## Profile API

### Get Profile

```typescript
import * as ProfileService from './database/profiles';

const profile = await ProfileService.getProfile(userId);
```

**Parameters:**
- `userId` (string): The user's unique identifier

**Returns:**
```typescript
interface Profile {
  id: string;
  name: string;
  bio?: string;
  country?: string;
  travel_interests: string[];
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}
```

### Update Profile

```typescript
const updates = {
  name: 'John Doe',
  bio: 'Passionate traveler',
  country: 'USA',
  travel_interests: ['hiking', 'culture'],
};

await ProfileService.updateProfile(userId, updates);
```

**Parameters:**
- `userId` (string): The user's unique identifier
- `updates` (Partial<Profile>): Fields to update

**Returns:** void (Promise)

### Get All Profiles

```typescript
const profiles = await ProfileService.getAllProfiles(excludeUserId);
```

**Parameters:**
- `excludeUserId` (optional, string): User ID to exclude from results

**Returns:** Array of Profile objects

## Buddy Requests API

### Send Buddy Request

```typescript
import * as BuddiesService from './database/buddies';

await BuddiesService.createBuddyRequest(senderId, receiverId);
```

**Parameters:**
- `senderId` (string): User sending the request
- `receiverId` (string): User receiving the request

**Returns:** void (Promise)

**Throws:** Error if request already exists or users are already buddies

### Get Received Requests

```typescript
const requests = await BuddiesService.getReceivedRequests(userId);
```

**Parameters:**
- `userId` (string): User ID

**Returns:**
```typescript
interface BuddyRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  sender?: Profile;
  receiver?: Profile;
  created_at: string;
  updated_at: string;
}
```

### Get Sent Requests

```typescript
const requests = await BuddiesService.getSentRequests(userId);
```

**Returns:** Array of BuddyRequest objects sent by user

### Get Accepted Buddies

```typescript
const buddies = await BuddiesService.getAcceptedBuddies(userId);
```

**Returns:** Array of accepted BuddyRequest objects (status === 'accepted')

### Update Buddy Request

```typescript
await BuddiesService.updateBuddyRequest(requestId, 'accepted');
```

**Parameters:**
- `requestId` (string): Request ID to update
- `status` ('accepted' | 'rejected'): New status

**Returns:** void (Promise)

## Trips API

### Create Trip

```typescript
import * as TripsService from './database/trips';

const tripData = {
  title: 'Europe Adventure',
  description: 'Summer vacation across Europe',
  destination: 'Europe',
  start_date: '2024-06-01',
  end_date: '2024-07-01',
};

const trip = await TripsService.createTrip(userId, tripData);
```

**Parameters:**
- `userId` (string): User creating the trip
- `tripData` (object): Trip details
  - `title` (string): Trip name
  - `description` (string): Trip description
  - `destination` (string): Primary destination
  - `start_date` (string): Start date (YYYY-MM-DD)
  - `end_date` (string): End date (YYYY-MM-DD)

**Returns:**
```typescript
interface Trip {
  id: string;
  user_id: string;
  title: string;
  description: string;
  destination: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}
```

### Get User Trips

```typescript
const trips = await TripsService.getTripsByUser(userId);
```

**Parameters:**
- `userId` (string): User ID

**Returns:** Array of Trip objects

### Update Trip

```typescript
const updates = { title: 'Updated Trip Name' };
await TripsService.updateTrip(tripId, updates);
```

**Parameters:**
- `tripId` (string): Trip ID
- `updates` (Partial<Trip>): Fields to update

**Returns:** void (Promise)

### Delete Trip

```typescript
await TripsService.deleteTrip(tripId);
```

**Parameters:**
- `tripId` (string): Trip ID to delete

**Returns:** void (Promise)

**Note:** Deletes all associated itinerary items

## Itinerary API

### Create Itinerary Item

```typescript
import * as ItineraryService from './database/itinerary';

const item = await ItineraryService.createItineraryItem(
  tripId,
  1,
  'Arrive in Paris, check into hotel'
);
```

**Parameters:**
- `tripId` (string): Associated trip ID
- `day` (number): Day number in trip
- `activity` (string): Activity description

**Returns:**
```typescript
interface ItineraryItem {
  id: string;
  trip_id: string;
  day: number;
  activity: string;
  created_at: string;
  updated_at: string;
}
```

### Get Trip Itinerary

```typescript
const itinerary = await ItineraryService.getItineraryByTrip(tripId);
```

**Parameters:**
- `tripId` (string): Trip ID

**Returns:** Array of ItineraryItem objects sorted by day

## Chat API

### Send Message

```typescript
import * as ChatService from './database/chat';

await ChatService.sendMessage(senderId, receiverId, 'Hello!');
```

**Parameters:**
- `senderId` (string): Sender user ID
- `receiverId` (string): Receiver user ID
- `message` (string): Message content

**Returns:** void (Promise)

### Get Conversation

```typescript
const messages = await ChatService.getConversation(userId1, userId2);
```

**Parameters:**
- `userId1` (string): First user
- `userId2` (string): Second user

**Returns:**
```typescript
interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}
```

### Get Conversations

```typescript
const conversations = await ChatService.getConversations(userId);
```

**Parameters:**
- `userId` (string): User ID

**Returns:** Array of unique conversation partners with last message

## Theme API

### Access Theme

```typescript
const { theme, themeMode } = useTheme();

// Use theme colors
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background,
    color: theme.text,
  },
});
```

**Theme Properties:**
- `primary` (string): Primary brand color
- `secondary` (string): Secondary color
- `accent` (string): Accent color
- `background` (string): Main background
- `surface` (string): Surface/card background
- `text` (string): Primary text color
- `textSecondary` (string): Secondary text color
- And 15+ more color variables

### Toggle Theme

```typescript
const { toggleTheme } = useTheme();

const handleThemeToggle = () => {
  toggleTheme(); // Switches between light and dark
};
```

### Set Theme Mode

```typescript
const { setThemeMode } = useTheme();

setThemeMode('dark'); // or 'light'
```

## Error Handling

All API calls should handle errors appropriately:

```typescript
try {
  const profile = await ProfileService.getProfile(userId);
} catch (error) {
  console.error('Error fetching profile:', error);
  // Display user-friendly error message
  Alert.alert('Error', 'Failed to load profile');
}
```

## Best Practices

1. **Always await promises** - All database operations are async
2. **Handle errors** - Use try-catch blocks
3. **Validate input** - Check data before sending
4. **Use TypeScript** - Type your API calls
5. **Cache when possible** - Store frequently accessed data
6. **Batch operations** - Combine multiple updates when possible
7. **Test thoroughly** - Write tests for API usage

## Rate Limiting

Current implementation has no rate limiting, but consider implementing:
- Max 100 API calls per minute
- Max 1000 API calls per hour
- Exponential backoff for retries

## Pagination

For large data sets, implement pagination:

```typescript
const pageSize = 20;
const page = 1;

const profiles = await ProfileService.getAllProfiles(
  undefined,
  pageSize,
  page
);
```

## Data Validation

All inputs are validated using Zod schema:

```typescript
const profileSchema = z.object({
  name: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
  country: z.string().max(100).optional(),
});

// Validation happens automatically in service layer
```

## Performance Tips

1. Minimize database queries - cache results
2. Use debouncing for search inputs
3. Paginate large lists
4. Lazy load images
5. Memoize expensive computations

## Version History

- **v1.0.0** - Initial API release
- **v1.1.0** - Added pagination support
- **v1.2.0** - Improved error handling

## Support

For API issues or questions, check:
- [TESTING.md](TESTING.md) - Testing examples
- Individual service files in `database/`
- Component examples in `components/`
