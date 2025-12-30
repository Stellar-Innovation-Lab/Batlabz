import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { MotiView } from 'moti';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export default function EMoneyTopupScreen() {
  const [step, setStep] = useState<'amount' | 'authorize' | 'processing' | 'success'>('amount');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [loading, setLoading] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [result, setResult] = useState<any>(null);

  const quickAmounts = [50, 100, 200, 500, 1000];

  const handleAuthorize = async () => {
    if (pin.length !== 4) {
      Alert.alert('Error', 'Please enter 4-digit PIN');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(
        `${BACKEND_URL}/api/wallet/emoney/authorize`,
        { phone: '', pin },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAuthCode(response.data.authorization_code);
      setStep('processing');
      
      // Simulate processing
      setTimeout(() => handleTopup(response.data.authorization_code), 1500);
    } catch (error: any) {
      Alert.alert('Authorization Failed', error.response?.data?.detail || 'Invalid PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async (code: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(
        `${BACKEND_URL}/api/wallet/emoney/topup`,
        {
          amount: parseFloat(amount),
          account_type: accountType,
          authorization_code: code
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(response.data);
      setStep('success');
    } catch (error: any) {
      Alert.alert('Top-up Failed', error.response?.data?.detail || 'Something went wrong');
      setStep('amount');
    }
  };

  const renderAmountStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="wallet" size={48} color="#4ade80" />
      </View>
      <Text style={styles.stepTitle}>Top-up Wallet</Text>
      <Text style={styles.stepSubtitle}>Add funds using e& money</Text>

      {/* Account Type */}
      <View style={styles.accountTypeContainer}>
        {['savings', 'current'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.accountTypeButton, accountType === type && styles.accountTypeActive]}
            onPress={() => setAccountType(type)}
          >
            <Text style={[styles.accountTypeText, accountType === type && styles.accountTypeTextActive]}>
              {type.charAt(0).toUpperCase() + type.slice(1)} Account
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Amount Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Enter Amount (AED)</Text>
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
      </View>

      {/* Quick Amount Buttons */}
      <View style={styles.quickAmountsContainer}>
        {quickAmounts.map((amt) => (
          <TouchableOpacity
            key={amt}
            style={styles.quickAmountButton}
            onPress={() => setAmount(amt.toString())}
          >
            <Text style={styles.quickAmountText}>AED {amt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Fee Info */}
      {amount && parseFloat(amount) > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.feeInfoCard}
        >
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Top-up Amount</Text>
            <Text style={styles.feeValue}>AED {parseFloat(amount).toFixed(2)}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Gateway Fee</Text>
            <Text style={styles.feeValue}>
              AED {Math.max(5, parseFloat(amount) * 0.015).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.feeRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Charged</Text>
            <Text style={styles.totalValue}>
              AED {(parseFloat(amount) + Math.max(5, parseFloat(amount) * 0.015)).toFixed(2)}
            </Text>
          </View>
        </MotiView>
      )}

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.continueButton, (!amount || parseFloat(amount) <= 0) && styles.buttonDisabled]}
        onPress={() => setStep('authorize')}
        disabled={!amount || parseFloat(amount) <= 0}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAuthorizeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="shield-checkmark" size={48} color="#4ade80" />
      </View>
      <Text style={styles.stepTitle}>Authorize Payment</Text>
      <Text style={styles.stepSubtitle}>Enter your e& money PIN</Text>

      {/* Amount Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Top-up Amount</Text>
        <Text style={styles.summaryAmount}>AED {parseFloat(amount).toFixed(2)}</Text>
        <Text style={styles.summaryAccount}>{accountType.charAt(0).toUpperCase() + accountType.slice(1)} Account</Text>
      </View>

      {/* PIN Input */}
      <View style={styles.pinContainer}>
        <Text style={styles.inputLabel}>Enter PIN</Text>
        <TextInput
          style={styles.pinInput}
          value={pin}
          onChangeText={(text) => setPin(text.slice(0, 4))}
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          placeholder="••••"
          placeholderTextColor="#64748b"
        />
        <Text style={styles.pinHint}>Demo PIN: 1234</Text>
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
          style={[styles.button, styles.primaryButton, (pin.length !== 4 || loading) && styles.buttonDisabled]}
          onPress={handleAuthorize}
          disabled={pin.length !== 4 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.primaryButtonText}>Authorize</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProcessingStep = () => (
    <View style={styles.stepContainer}>
      <MotiView
        from={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.processingContainer}
      >
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.processingText}>Processing...</Text>
        <Text style={styles.processingSubtext}>Please wait while we process your top-up</Text>
      </MotiView>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <MotiView
        from={{ scale: 0, rotate: '-180deg' }}
        animate={{ scale: 1, rotate: '0deg' }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.successIcon}
      >
        <Ionicons name="checkmark-circle" size={80} color="#4ade80" />
      </MotiView>
      <Text style={styles.successTitle}>Top-up Successful!</Text>
      <Text style={styles.successSubtitle}>Your wallet has been credited</Text>

      {/* Success Details */}
      {result && (
        <View style={styles.successCard}>
          <View style={styles.successRow}>
            <Text style={styles.successLabel}>Amount Credited</Text>
            <Text style={styles.successValue}>AED {result.amount_credited?.toFixed(2)}</Text>
          </View>
          <View style={styles.successRow}>
            <Text style={styles.successLabel}>Gateway Fee</Text>
            <Text style={styles.successValue}>AED {result.gateway_fee?.toFixed(2)}</Text>
          </View>
          <View style={styles.successRow}>
            <Text style={styles.successLabel}>New Balance</Text>
            <Text style={[styles.successValue, styles.highlightValue]}>AED {result.new_balance?.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.successRow}>
            <Text style={styles.successLabel}>Reference Number</Text>
            <Text style={styles.referenceNumber}>{result.reference_number}</Text>
          </View>
        </View>
      )}

      {/* Done Button */}
      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => router.back()}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>e& money Top-up</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {['amount', 'authorize', 'success'].map((s, index) => (
          <View key={s} style={styles.progressStep}>
            <View style={[styles.progressDot, (step === s || ['processing', 'success'].includes(step)) && styles.progressDotActive]} />
            {index < 2 && <View style={[styles.progressLine, ['processing', 'success'].includes(step) && styles.progressLineActive]} />}
          </View>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        {step === 'amount' && renderAmountStep()}
        {step === 'authorize' && renderAuthorizeStep()}
        {step === 'processing' && renderProcessingStep()}
        {step === 'success' && renderSuccessStep()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1e293b',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 40,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#334155',
  },
  progressDotActive: {
    backgroundColor: '#4ade80',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#334155',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#4ade80',
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  accountTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
  },
  accountTypeActive: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  accountTypeText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  accountTypeTextActive: {
    color: '#4ade80',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
    fontWeight: '500',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#334155',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ade80',
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    paddingVertical: 16,
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  quickAmountButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickAmountText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  feeInfoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  feeValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  continueButton: {
    backgroundColor: '#4ade80',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  summaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 8,
  },
  summaryAccount: {
    fontSize: 14,
    color: '#94a3b8',
  },
  pinContainer: {
    marginBottom: 32,
  },
  pinInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 12,
    borderWidth: 2,
    borderColor: '#334155',
  },
  pinHint: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4ade80',
  },
  secondaryButton: {
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  processingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
  },
  processingSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
  },
  successCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#334155',
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  successLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  successValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  highlightValue: {
    fontSize: 18,
    color: '#4ade80',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 12,
  },
  referenceNumber: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#4ade80',
  },
  doneButton: {
    backgroundColor: '#4ade80',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});