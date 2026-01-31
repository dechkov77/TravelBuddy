import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { NetworkProvider } from "../contexts/NetworkContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { getDatabase } from "../database/init";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function RootLayout() {
  useEffect(() => {
    // Initialize database on app start (works on both web and native)
    getDatabase().catch((error) => {
      console.error('Database initialization error:', error);
    });
  }, []);

  return (
    <ThemeProvider>
      <NetworkProvider>
        <AuthProvider>
          <Stack
            screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </NetworkProvider>
    </ThemeProvider>
  );
}
