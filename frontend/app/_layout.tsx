import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/store/authStore';
import { COLORS } from '../src/components/theme';

export default function RootLayout() {
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/otp" />
        <Stack.Screen name="auth/profile-setup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="team/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="team/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="team/join" options={{ presentation: 'modal' }} />
        <Stack.Screen name="match/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="match/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="wallet/topup" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
