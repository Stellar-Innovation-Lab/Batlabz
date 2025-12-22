import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Button, Input, Card } from '../../src/components';
import { teamAPI } from '../../src/services/api';

export default function JoinTeamScreen() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [joinedTeamId, setJoinedTeamId] = useState('');

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await teamAPI.joinByCode(inviteCode.trim().toUpperCase());
      setSuccess(true);
      setJoinedTeamId(response.data.team_id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid invite code');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>You're In!</Text>
          <Text style={styles.successText}>You've successfully joined the team</Text>
          <Button
            title="View Team"
            onPress={() => router.replace(`/team/${joinedTeamId}`)}
            fullWidth
            size="lg"
            style={{ marginTop: SPACING.xl }}
          />
          <Button
            title="Go to Teams"
            onPress={() => router.replace('/(tabs)/teams')}
            variant="ghost"
            fullWidth
            style={{ marginTop: SPACING.sm }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Join Team</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.teamIcon}>
              <Ionicons name="enter" size={48} color={COLORS.primary} />
            </View>
          </View>

          <Text style={styles.title}>Enter Invite Code</Text>
          <Text style={styles.subtitle}>
            Ask your team captain for the invite code to join their team
          </Text>

          <Input
            placeholder="E.g. ABC12345"
            value={inviteCode}
            onChangeText={(text) => setInviteCode(text.toUpperCase())}
            error={error}
            autoCapitalize="characters"
            maxLength={8}
            containerStyle={styles.input}
          />

          <Button
            title="Join Team"
            onPress={handleJoin}
            loading={loading}
            fullWidth
            size="lg"
          />

          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={20} color={COLORS.info} />
              <Text style={styles.infoText}>
                The invite code is usually 8 characters and can be found in the team details page.
              </Text>
            </View>
          </Card>
        </View>
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
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
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
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  input: {
    marginBottom: SPACING.lg,
  },
  infoCard: {
    backgroundColor: COLORS.info + '10',
    borderColor: COLORS.info + '30',
    marginTop: SPACING.lg,
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  successIcon: {
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  successText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
});
