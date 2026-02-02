import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { NetworkProvider } from "../contexts/NetworkContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { getDatabase } from "../database/init";
import * as BuddyService from "../database/buddies";
import { useEffect } from "react";
import { Platform } from "react-native";
import React from "react";
export default function RootLayout() {
  useEffect(() => {
    getDatabase().catch((error) => {
    });
    BuddyService.cleanupDuplicateBuddies().catch((error) => {
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