// Mock React Native modules
jest.mock('react-native', () => ({
  View: jest.fn(),
  Text: jest.fn(),
  TextInput: jest.fn(),
  ScrollView: jest.fn(),
  FlatList: jest.fn(),
  TouchableOpacity: jest.fn(),
  TouchableHighlight: jest.fn(),
  Platform: {
    OS: 'ios',
    select: (obj) => obj.ios,
  },
  AsyncStorage: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
}));

// Mock expo vector icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: jest.fn(() => null),
  MaterialIcons: jest.fn(() => null),
  FontAwesome: jest.fn(() => null),
  FontAwesome5: jest.fn(() => null),
  Entypo: jest.fn(() => null),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  launchImageLibraryAsync: jest.fn(),
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(),
}));

// Global test utilities
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
