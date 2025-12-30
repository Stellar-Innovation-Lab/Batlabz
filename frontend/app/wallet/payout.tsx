import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://cricket-payments-1.preview.emergentagent.com';

export default function PayoutScreen() {
  const [step, setStep] = useState<'amount' | 'bank' | 'confirm' | 'processing' | 'success'>('amount');
  const [amount, setAmount] = useState('');
  const [iban, setIban] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [userBalance, setUserBalance] = useState(0);

  React.useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(`${BACKEND_URL}/api/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const calculateFees = () => {
    const amt = parseFloat(amount) || 0;
    const payoutFee = Math.max(5, amt * 0.015);
    const totalDeduction = amt + payoutFee;
    return { payoutFee, totalDeduction, netAmount: amt };
  };

  const handlePayout = async () => {
    setLoading(true);
    setStep('processing');

    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(
        `${BACKEND_URL}/api/wallet/emoney/payout`,
        {
          amount: parseFloat(amount),
          account_type: 'savings',
          iban: iban
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(response.data);
      setStep('success');
    } catch (error: any) {
      Alert.alert('Payout Failed', error.response?.data?.detail || 'Something went wrong');
      setStep('amount');
    } finally {
      setLoading(false);
    }
  };

  const renderAmountStep = () => {
    const { payoutFee, totalDeduction } = calculateFees();
    const canProceed = parseFloat(amount) > 0 && parseFloat(amount) <= userBalance;

    return (
      <View style={styles.stepContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="cash" size={48} color="#4ade80" />
        </View>
        <Text style={styles.stepTitle}>Withdraw to Bank</Text>
        <Text style={styles.stepSubtitle}>Transfer funds to your bank account</Text>

        {/* Balance Info */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>AED {userBalance.toFixed(2)}</Text>
        </View>

        {/* Amount Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Withdrawal Amount (AED)</Text>
          <View style={styles.amountInputWrapper}>
            <Text style={styles.currencySymbol}>AED</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#64748b"
            />
          </View>
          {parseFloat(amount) > userBalance && (
            <Text style={styles.errorText}>Insufficient balance</Text>
          )}
        </View>

        {/* Fee Breakdown */}
        {amount && parseFloat(amount) > 0 && (
          <View style={styles.feeCard}>
            <Text style={styles.feeTitle}>Fee Breakdown</Text>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Withdrawal Amount</Text>
              <Text style={styles.feeValue}>AED {parseFloat(amount).toFixed(2)}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Payout Fee (max of AED 5 or 1.5%)</Text>
              <Text style={styles.feeValue}>AED {payoutFee.toFixed(2)}</Text>
            </View>
            <View style={[styles.feeRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Deducted</Text>
              <Text style={styles.totalValue}>AED {totalDeduction.toFixed(2)}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.netLabel}>You Will Receive</Text>
              <Text style={styles.netValue}>AED {parseFloat(amount).toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.button, !canProceed && styles.buttonDisabled]}
          onPress={() => setStep('bank')}
          disabled={!canProceed}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBankStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="business" size={48} color="#4ade80" />
      </View>
      <Text style={styles.stepTitle}>Bank Account Details</Text>
      <Text style={styles.stepSubtitle}>Enter your bank account information</Text>

      {/* Bank Name */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Bank Name</Text>
        <TextInput
          style={styles.textInput}
          value={bankName}
          onChangeText={setBankName}
          placeholder="e.g., Emirates NBD"
          placeholderTextColor="#64748b"
        />
      </View>

      {/* Account Name */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Account Holder Name</Text>
        <TextInput
          style={styles.textInput}
          value={accountName}
          onChangeText={setAccountName}
          placeholder="Full name as per bank"
          placeholderTextColor="#64748b"
        />
      </View>

      {/* IBAN */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>IBAN</Text>
        <TextInput
          style={styles.textInput}
          value={iban}
          onChangeText={(text) => setIban(text.toUpperCase())}
          placeholder="AE07 0331 2345 6789 0123 456"
          placeholderTextColor="#64748b"
          maxLength={34}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setStep('amount')}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, (!iban || !accountName || !bankName) && styles.buttonDisabled]}
          onPress={() => setStep('confirm')}
          disabled={!iban || !accountName || !bankName}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConfirmStep = () => {
    const { payoutFee, totalDeduction } = calculateFees();

    return (
      <View style={styles.stepContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={48} color="#4ade80" />
        </View>
        <Text style={styles.stepTitle}>Confirm Withdrawal</Text>
        <Text style={styles.stepSubtitle}>Please review the details carefully</Text>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount</Text>
            <Text style={styles.summaryValue}>AED {parseFloat(amount).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payout Fee</Text>
            <Text style={styles.summaryValue}>AED {payoutFee.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.summaryLabel}>Total Deducted</Text>
            <Text style={[styles.summaryValue, styles.highlight]}>AED {totalDeduction.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Bank</Text>
            <Text style={styles.summaryValue}>{bankName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Account</Text>
            <Text style={styles.summaryValue}>{accountName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>IBAN</Text>
            <Text style={styles.summaryValue}>{iban}</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setStep('bank')}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handlePayout}
          >
            <Text style={styles.buttonText}>Confirm Withdrawal</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderProcessingStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.processingText}>Processing Withdrawal...</Text>
        <Text style={styles.processingSubtext}>This usually takes 1-2 business days</Text>
      </View>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={80} color="#4ade80" />
      </View>
      <Text style={styles.successTitle}>Withdrawal Initiated!</Text>
      <Text style={styles.successSubtext}>Funds will arrive in 1-2 business days</Text>

      {result && (
        <View style={styles.successCard}>
          <View style={styles.successRow}>
            <Text style={styles.successLabel}>Amount Withdrawn</Text>
            <Text style={styles.successValue}>AED {result.amount_withdrawn?.toFixed(2)}</Text>
          </View>
          <View style={styles.successRow}>
            <Text style={styles.successLabel}>Payout Fee</Text>
            <Text style={styles.successValue}>AED {result.payout_fee?.toFixed(2)}</Text>
          </View>
          <View style={styles.successRow}>
            <Text style={styles.successLabel}>Total Deducted</Text>
            <Text style={[styles.successValue, styles.highlight]}>AED {result.total_deducted?.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.successRow}>
            <Text style={styles.successLabel}>Reference Number</Text>
            <Text style={styles.referenceNumber}>{result.reference_number}</Text>
          </View>
          <View style={styles.successRow}>
            <Text style={styles.successLabel}>Estimated Arrival</Text>
            <Text style={styles.successValue}>{result.estimated_arrival}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdraw to Bank</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          {['amount', 'bank', 'confirm', 'success'].map((s, index) => (
            <View key={s} style={styles.progressItem}>
              <View style={[styles.progressDot, (step === s || ['processing', 'success'].includes(step)) && styles.progressDotActive]} />
              {index < 3 && <View style={[styles.progressLine, ['processing', 'success'].includes(step) && styles.progressLineActive]} />}
            </View>
          ))}
        </View>

        <ScrollView style={styles.scrollView}>
          {step === 'amount' && renderAmountStep()}
          {step === 'bank' && renderBankStep()}
          {step === 'confirm' && renderConfirmStep()}
          {step === 'processing' && renderProcessingStep()}
          {step === 'success' && renderSuccessStep()}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  progressItem: { flexDirection: 'row', alignItems: 'center' },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#334155' },
  progressDotActive: { backgroundColor: '#4ade80' },
  progressLine: { width: 30, height: 2, backgroundColor: '#334155', marginHorizontal: 6 },
  progressLineActive: { backgroundColor: '#4ade80' },
  scrollView: { flex: 1 },
  stepContainer: { padding: 20 },
  iconContainer: { alignItems: 'center', marginBottom: 20 },
  stepTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  stepSubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 24 },
  balanceCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  balanceLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  balanceAmount: { fontSize: 32, fontWeight: 'bold', color: '#4ade80' },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 14, color: '#94a3b8', marginBottom: 8 },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#334155',
  },
  currencySymbol: { fontSize: 20, fontWeight: 'bold', color: '#4ade80', marginRight: 12 },
  amountInput: { flex: 1, fontSize: 28, fontWeight: 'bold', color: '#fff', paddingVertical: 16 },
  textInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 2,
    borderColor: '#334155',
  },
  errorText: { fontSize: 12, color: '#ef4444', marginTop: 4 },
  feeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  feeTitle: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 12 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  feeLabel: { fontSize: 13, color: '#94a3b8', flex: 1 },
  feeValue: { fontSize: 13, fontWeight: '500', color: '#fff' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#334155', marginTop: 8, paddingTop: 12 },
  totalLabel: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  totalValue: { fontSize: 14, fontWeight: 'bold', color: '#ef4444' },
  netLabel: { fontSize: 14, fontWeight: 'bold', color: '#4ade80' },
  netValue: { fontSize: 14, fontWeight: 'bold', color: '#4ade80' },
  button: {
    backgroundColor: '#4ade80',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  buttonRow: { flexDirection: 'row', gap: 12 },
  primaryButton: { flex: 1, backgroundColor: '#4ade80' },
  secondaryButton: { flex: 1, backgroundColor: '#334155' },
  secondaryButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  summaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { fontSize: 13, color: '#94a3b8' },
  summaryValue: { fontSize: 13, fontWeight: '600', color: '#fff' },
  highlight: { color: '#ef4444' },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 12 },
  processingContainer: { alignItems: 'center', paddingVertical: 60 },
  processingText: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 20 },
  processingSubtext: { fontSize: 14, color: '#94a3b8', marginTop: 8, textAlign: 'center' },
  successIcon: { alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  successSubtext: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 24 },
  successCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  successRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  successLabel: { fontSize: 13, color: '#94a3b8' },
  successValue: { fontSize: 13, fontWeight: '600', color: '#fff' },
  referenceNumber: { fontSize: 11, fontFamily: 'monospace', color: '#4ade80' },
  doneButton: {
    backgroundColor: '#4ade80',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
});