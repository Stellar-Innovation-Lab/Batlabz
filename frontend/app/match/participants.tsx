import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

interface Participant {
  user_id: string;
  name: string;
  phone: string;
  playing_role: string;
  amount_due: number;
  amount_paid: number;
  status: string;
  paid_at?: string;
  is_guest: boolean;
}

interface ParticipantsData {
  match_id: string;
  match_title: string;
  total_participants: number;
  paid: Participant[];
  partial: Participant[];
  pending: Participant[];
  summary: {
    paid_count: number;
    partial_count: number;
    pending_count: number;
    total_collected: number;
    total_due: number;
  };
}

export default function MatchParticipantsScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<ParticipantsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'pending'>('all');

  useEffect(() => {
    fetchParticipants();
  }, [id]);

  const fetchParticipants = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get(`${BACKEND_URL}/api/matches/${id}/participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setData(response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching participants:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchParticipants();
  };

  const renderParticipant = (participant: Participant) => {
    const isPaid = participant.status === 'paid';
    const isPartial = participant.status === 'partial';
    const outstanding = participant.amount_due - participant.amount_paid;

    return (
      <View key={participant.user_id} style={styles.participantCard}>
        <View style={styles.participantHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{participant.name?.[0] || 'U'}</Text>
          </View>
          <View style={styles.participantInfo}>
            <Text style={styles.participantName}>{participant.name}</Text>
            <Text style={styles.participantPhone}>{participant.phone}</Text>
            <View style={styles.roleRow}>
              <Text style={styles.roleChip}>{participant.playing_role || 'Player'}</Text>
              {participant.is_guest && <Text style={styles.guestChip}>Guest</Text>}
            </View>
          </View>
          <View style={styles.paymentInfo}>
            <View style={[styles.statusBadge, isPaid ? styles.paidBadge : isPartial ? styles.partialBadge : styles.pendingBadge]}>
              <Text style={styles.statusText}>{participant.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.paymentDetails}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Amount Due</Text>
            <Text style={styles.paymentValue}>AED {participant.amount_due.toFixed(2)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Amount Paid</Text>
            <Text style={[styles.paymentValue, styles.paidAmount]}>AED {participant.amount_paid.toFixed(2)}</Text>
          </View>
          {outstanding > 0 && (
            <View style={[styles.paymentRow, styles.outstandingRow]}>
              <Text style={styles.outstandingLabel}>Outstanding</Text>
              <Text style={styles.outstandingValue}>AED {outstanding.toFixed(2)}</Text>
            </View>
          )}
        </View>

        {participant.paid_at && (
          <Text style={styles.paidDate}>
            Paid on {new Date(participant.paid_at).toLocaleDateString()}
          </Text>
        )}
      </View>
    );
  };

  if (loading || !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  const getDisplayParticipants = () => {
    if (activeTab === 'paid') return data.paid;
    if (activeTab === 'pending') return [...data.pending, ...data.partial];
    return [...data.paid, ...data.partial, ...data.pending];
  };

  const displayParticipants = getDisplayParticipants();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Match Participants</Text>
          <Text style={styles.subtitle}>{data.match_title}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{data.total_participants}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, styles.paidValue]}>{data.summary.paid_count}</Text>
            <Text style={styles.summaryLabel}>Paid</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, styles.pendingValue]}>{data.summary.pending_count + data.summary.partial_count}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.amountRow}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Collected</Text>
            <Text style={styles.amountValue}>AED {data.summary.total_collected.toFixed(2)}</Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Outstanding</Text>
            <Text style={[styles.amountValue, styles.outstandingAmount]}>
              AED {(data.summary.total_due - data.summary.total_collected).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: 'all', label: `All (${data.total_participants})` },
          { key: 'paid', label: `Paid (${data.summary.paid_count})` },
          { key: 'pending', label: `Pending (${data.summary.pending_count + data.summary.partial_count})` },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Participants List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ade80" />}
      >
        {displayParticipants.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#64748b" />
            <Text style={styles.emptyText}>No participants in this category</Text>
          </View>
        ) : (
          displayParticipants.map(renderParticipant)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  paidValue: {
    color: '#4ade80',
  },
  pendingValue: {
    color: '#f59e0b',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
  },
  amountItem: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  outstandingAmount: {
    color: '#f59e0b',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4ade80',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#4ade80',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  participantCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  participantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4ade80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  participantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  participantPhone: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 6,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  roleChip: {
    fontSize: 10,
    color: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  guestChip: {
    fontSize: 10,
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  paymentInfo: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
  },
  partialBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  paymentDetails: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  paymentLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  paymentValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  paidAmount: {
    color: '#4ade80',
  },
  outstandingRow: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    marginTop: 6,
    paddingTop: 12,
  },
  outstandingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  outstandingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  paidDate: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 16,
  },
});