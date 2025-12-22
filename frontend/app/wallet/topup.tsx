import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Button, Input, Card } from '../../src/components';
import { walletAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';

const PRESET_AMOUNTS = [50, 100, 200, 500];

export default function TopupScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [newBalance, setNewBalance] = useState(0);

  const handleTopup = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await walletAPI.topup(numAmount, 'card');
      setNewBalance(response.data.new_balance);
      setSuccess(true);
      
      // Update user balance in store
      if (user) {
        setUser({ ...user, wallet_balance: response.data.new_balance });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Top-up failed');
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
          <Text style={styles.successTitle}>Top-up Successful!</Text>
          <Text style={styles.successAmount}>+AED {parseFloat(amount).toFixed(2)}</Text>
          <Text style={styles.newBalance}>New Balance: AED {newBalance.toFixed(2)}</Text>
          <Button
            title="Done"
            onPress={() => router.back()}
            fullWidth
            size="lg"
            style={{ marginTop: SPACING.xl }}
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
        <Text style={styles.headerTitle}>Top Up Wallet</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Current Balance */}
          <Card style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceAmount}>AED {(user?.wallet_balance || 0).toFixed(2)}</Text>
          </Card>

          {/* Amount Input */}
          <Text style={styles.label}>Enter Amount (AED)</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencyPrefix}>AED</Text>
            <Input
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              containerStyle={styles.amountInput}
            />
          </View>

          {/* Preset Amounts */}
          <View style={styles.presetsContainer}>
            {PRESET_AMOUNTS.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetChip,
                  amount === String(preset) && styles.presetChipSelected,
                ]}
                onPress={() => setAmount(String(preset))}
              >
                <Text
                  style={[
                    styles.presetText,
                    amount === String(preset) && styles.presetTextSelected,
                  ]}
                >
                  {preset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          {/* Payment Methods (Mock) */}
          <Text style={styles.label}>Payment Method</Text>
          <Card style={styles.paymentMethod}>
            <View style={styles.paymentRow}>
              <View style={styles.paymentIcon}>
                <Ionicons name="card" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Credit/Debit Card</Text>
                <Text style={styles.paymentSubtitle}>Visa, Mastercard, etc.</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            </View>
          </Card>

          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={20} color={COLORS.info} />
              <Text style={styles.infoText}>
                This is a mock payment. In production, you would be redirected to a secure payment gateway.
              </Text>
            </View>
          </Card>

          <Button
            title={`Top Up AED ${amount || '0.00'}`}
            onPress={handleTopup}
            loading={loading}
            fullWidth
            size="lg"
            disabled={!amount || parseFloat(amount) <= 0}
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
  balanceCard: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  balanceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  balanceAmount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  currencyPrefix: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  amountInput: {
    flex: 1,
    marginBottom: 0,
  },
  presetsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  presetChip: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  presetText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  presetTextSelected: {
    color: COLORS.primary,
  },
  error: {
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  paymentMethod: {
    marginBottom: SPACING.lg,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  paymentSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
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
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  successAmount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  newBalance: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
});
