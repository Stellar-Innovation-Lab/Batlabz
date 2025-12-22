import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Button, Input, Card } from '../../src/components';
import { userAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { PlayingRole } from '../../src/types';

const PLAYING_ROLES = [
  { value: PlayingRole.BATSMAN, label: 'Batsman', icon: 'baseball-outline' },
  { value: PlayingRole.BOWLER, label: 'Bowler', icon: 'baseball' },
  { value: PlayingRole.ALL_ROUNDER, label: 'All-Rounder', icon: 'star-outline' },
  { value: PlayingRole.WICKET_KEEPER, label: 'Wicket Keeper', icon: 'hand-left-outline' },
];

const LOCATIONS = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah'];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [playingRole, setPlayingRole] = useState<PlayingRole>(PlayingRole.ALL_ROUNDER);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleLocation = (location: string) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await userAPI.completeProfile({
        name: name.trim(),
        nickname: nickname.trim() || null,
        playing_role: playingRole,
        preferred_locations: selectedLocations,
      });

      setUser(response.data);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Let's set up your cricket profile</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name *"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              error={error && !name ? error : undefined}
              leftIcon={<Ionicons name="person-outline" size={20} color={COLORS.textMuted} />}
            />

            <Input
              label="Nickname"
              placeholder="What do your teammates call you?"
              value={nickname}
              onChangeText={setNickname}
              leftIcon={<Ionicons name="happy-outline" size={20} color={COLORS.textMuted} />}
            />

            <Text style={styles.sectionTitle}>Playing Role</Text>
            <View style={styles.rolesGrid}>
              {PLAYING_ROLES.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleCard,
                    playingRole === role.value && styles.roleCardSelected,
                  ]}
                  onPress={() => setPlayingRole(role.value)}
                >
                  <Ionicons
                    name={role.icon as any}
                    size={28}
                    color={playingRole === role.value ? COLORS.primary : COLORS.textMuted}
                  />
                  <Text
                    style={[
                      styles.roleLabel,
                      playingRole === role.value && styles.roleLabelSelected,
                    ]}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Preferred Locations</Text>
            <View style={styles.locationsGrid}>
              {LOCATIONS.map((location) => (
                <TouchableOpacity
                  key={location}
                  style={[
                    styles.locationChip,
                    selectedLocations.includes(location) && styles.locationChipSelected,
                  ]}
                  onPress={() => toggleLocation(location)}
                >
                  <Text
                    style={[
                      styles.locationText,
                      selectedLocations.includes(location) && styles.locationTextSelected,
                    ]}
                  >
                    {location}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <Button
              title="Get Started"
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.button}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
    marginTop: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  form: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  roleCard: {
    width: '48%',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  roleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.backgroundLight,
  },
  roleLabel: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  roleLabelSelected: {
    color: COLORS.primary,
  },
  locationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  locationChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.backgroundLight,
  },
  locationText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  locationTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  error: {
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  button: {
    marginTop: SPACING.md,
  },
});
