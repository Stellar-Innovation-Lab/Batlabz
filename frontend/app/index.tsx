import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { COLORS, FONT_SIZES, SPACING } from '../src/components/theme';
import { LoadingScreen } from '../src/components/LoadingScreen';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          if (user?.name) {
            router.replace('/(tabs)');
          } else {
            router.replace('/auth/profile-setup');
          }
        } else {
          router.replace('/auth/login');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, user]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.iconWrapper}>
          <Ionicons name="baseball" size={80} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>BATLABZ</Text>
        <Text style={styles.subtitle}>Pay & Play Cricket</Text>
      </View>
      
      <View style={styles.taglineContainer}>
        <Text style={styles.tagline}>Schedule. Split. Play.</Text>
      </View>
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <LoadingScreen message="Loading..." />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    marginTop: SPACING.sm,
    fontWeight: '500',
  },
  taglineContainer: {
    position: 'absolute',
    bottom: 100,
  },
  tagline: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 50,
  },
});
