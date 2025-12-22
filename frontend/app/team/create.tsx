import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../src/components/theme';
import { Button, Input, Card } from '../../src/components';
import { teamAPI } from '../../src/services/api';

const EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'];

export default function CreateTeamScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Team name is required');
      return;
    }
    if (!location) {
      setError('Please select a home location');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await teamAPI.create({
        name: name.trim(),
        home_location: location,
      });
      router.replace(`/team/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Team</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.iconContainer}>
            <View style={styles.teamIcon}>
              <Ionicons name="people" size={48} color={COLORS.primary} />
            </View>
          </View>

          <Input
            label="Team Name"
            placeholder="Enter team name"
            value={name}
            onChangeText={setName}
            leftIcon={<Ionicons name="shield-outline" size={20} color={COLORS.textMuted} />}
          />

          <Text style={styles.label}>Home Location</Text>
          <View style={styles.locationGrid}>
            {EMIRATES.map((emirate) => (
              <TouchableOpacity
                key={emirate}
                style={[
                  styles.locationChip,
                  location === emirate && styles.locationChipSelected,
                ]}
                onPress={() => setLocation(emirate)}
              >
                <Text
                  style={[
                    styles.locationText,
                    location === emirate && styles.locationTextSelected,
                  ]}
                >
                  {emirate}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={20} color={COLORS.info} />
              <Text style={styles.infoText}>
                As the creator, you'll be the team captain. You can invite players, create matches, and manage payments.
              </Text>
            </View>
          </Card>

          <Button
            title="Create Team"
            onPress={handleCreate}
            loading={loading}
            fullWidth
            size="lg"
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  teamIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  locationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  locationChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  locationText: {
    fontSize: FONT_SIZES.sm,
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
  infoCard: {
    backgroundColor: COLORS.info + '10',
    borderColor: COLORS.info + '30',
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
