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
        {/* Main Screens */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Auth Screens */}
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/otp" options={{ headerShown: false }} />
        <Stack.Screen name="auth/profile-setup" options={{ presentation: 'modal' }} />
        
        {/* Team Screens */}
        <Stack.Screen name="team/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="team/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="team/join" options={{ presentation: 'modal' }} />
        <Stack.Screen name="team/announcements" options={{ presentation: 'card' }} />
        <Stack.Screen name="team/captain-dashboard" options={{ presentation: 'card' }} />
        <Stack.Screen name="team/chat" options={{ presentation: 'card' }} />
        
        {/* Match Screens */}
        <Stack.Screen name="match/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="match/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="match/participants" options={{ presentation: 'card' }} />
        <Stack.Screen name="match/rides" options={{ presentation: 'card' }} />
        
        {/* Wallet Screens */}
        <Stack.Screen name="wallet/topup" options={{ presentation: 'modal' }} />
        <Stack.Screen name="wallet/transactions" options={{ presentation: 'card' }} />
        <Stack.Screen name="wallet/enhanced-transactions" options={{ presentation: 'card' }} />
        <Stack.Screen name="wallet/emoney-topup" options={{ presentation: 'modal' }} />
        <Stack.Screen name="wallet/payout" options={{ presentation: 'modal' }} />
        
        {/* Player Screens */}
        <Stack.Screen name="players/index" options={{ presentation: 'card' }} />
        <Stack.Screen name="players/[id]" options={{ presentation: 'card' }} />
        
        {/* Ground Screens */}
        <Stack.Screen name="ground/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="ground/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="ground/manage-slots" options={{ presentation: 'card' }} />
        <Stack.Screen name="ground/owner-dashboard" options={{ presentation: 'card' }} />
        
        {/* Profile Screens */}
        <Stack.Screen name="profile/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="profile/settings" options={{ presentation: 'card' }} />
        
        {/* AI Screens */}
        <Stack.Screen name="ai/index" options={{ presentation: 'card' }} />
        <Stack.Screen name="ai/matchmaking" options={{ presentation: 'card' }} />
        <Stack.Screen name="ai/prediction" options={{ presentation: 'card' }} />
        <Stack.Screen name="ai/my-stats" options={{ presentation: 'card' }} />
        <Stack.Screen name="ai/player-recommendations" options={{ presentation: 'card' }} />
        
        {/* Captain Screens */}
        <Stack.Screen name="captain/financial-dashboard" options={{ presentation: 'card' }} />
        
        {/* Admin Screens */}
        <Stack.Screen name="admin/dashboard" options={{ presentation: 'card' }} />
        
        {/* Notifications */}
        <Stack.Screen name="notifications/index" options={{ presentation: 'card' }} />
      </Stack>
    </>
  );
}
