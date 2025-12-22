import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Card, Button, Input } from '../../src/components';
import { userAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { PlayingRole } from '../../src/types';

const PLAYING_ROLES = [
  { value: PlayingRole.BATSMAN, label: 'Batsman', icon: 'baseball' },
  { value: PlayingRole.BOWLER, label: 'Bowler', icon: 'baseball-outline' },
  { value: PlayingRole.ALL_ROUNDER, label: 'All-Rounder', icon: 'star' },
  { value: PlayingRole.WICKET_KEEPER, label: 'Wicket Keeper', icon: 'hand-left' },
];

const UAE_LOCATIONS = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  
  const [name, setName] = useState(user?.name || '');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [playingRole, setPlayingRole] = useState<PlayingRole>(user?.playing_role || PlayingRole.ALL_ROUNDER);
  const [preferredLocations, setPreferredLocations] = useState<string[]>(user?.preferred_locations || []);
  const [loading, setLoading] = useState(false);

  const toggleLocation = (location: string) => {
    if (preferredLocations.includes(location)) {
      setPreferredLocations(preferredLocations.filter(l => l !== location));
    } else {
      setPreferredLocations([...preferredLocations, location]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.updateMe({
        name: name.trim(),
        nickname: nickname.trim() || null,
        email: email.trim() || null,
        playing_role: playingRole,
        preferred_locations: preferredLocations,
      });
      setUser(response.data);
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Info</Text>
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              icon={<Ionicons name="person-outline" size={20} color={COLORS.textMuted} />}
            />
            <Input
              label="Nickname (optional)"
              value={nickname}
              onChangeText={setNickname}
              placeholder="How should teammates call you?"
              icon={<Ionicons name="happy-outline" size={20} color={COLORS.textMuted} />}
            />
            <Input
              label="Email (optional)"
              value={email}
              onChangeText={setEmail}
              placeholder="For receipts and notifications"
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Ionicons name="mail-outline" size={20} color={COLORS.textMuted} />}
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Playing Role</Text>
            <View style={styles.rolesGrid}>
              {PLAYING_ROLES.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleCard,
                    playingRole === role.value && styles.roleCardActive,
                  ]}
                  onPress={() => setPlayingRole(role.value)}
                >
                  <Ionicons
                    name={role.icon as any}
                    size={24}
                    color={playingRole === role.value ? COLORS.primary : COLORS.textMuted}
                  />
                  <Text
                    style={[
                      styles.roleLabel,
                      playingRole === role.value && styles.roleLabelActive,
                    ]}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Preferred Locations</Text>
            <View style={styles.locationsGrid}>
              {UAE_LOCATIONS.map((location) => (
                <TouchableOpacity
                  key={location}
                  style={[
                    styles.locationChip,
                    preferredLocations.includes(location) && styles.locationChipActive,
                  ]}
                  onPress={() => toggleLocation(location)}
                >
                  <Text
                    style={[
                      styles.locationText,
                      preferredLocations.includes(location) && styles.locationTextActive,
                    ]}
                  >
                    {location}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: SPACING.md }}
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 44,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  roleCard: {
    width: '48%',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  roleLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  roleLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  locationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  locationChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationChipActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  locationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  locationTextActive: {
    color: COLORS.primary,
    fontWeight: '500',
  },
});
