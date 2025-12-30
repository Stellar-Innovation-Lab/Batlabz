import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

interface PlayerDetail {
  player: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    playing_role?: string;
    role: string;
    wallet_balance: number;
    total_spent: number;
    is_active: boolean;
  };
  matches: any[];
  transactions: any[];
  teams: any[];
  stats: {
    matches_played: number;
    win_rate: number;
    impact_score: number;
    reliability_score: number;
  };
}

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams();
  const [playerData, setPlayerData] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPlayerDetail();
  }, [id]);

  const fetchPlayerDetail = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return;

      const response = await axios.get(`${BACKEND_URL}/api/players/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPlayerData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching player detail:', error);
      setLoading(false);
    }
  };

  const handleActivateDeactivate = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const endpoint = playerData?.player.is_active ? 'deactivate' : 'activate';
      
      await axios.post(`${BACKEND_URL}/api/players/${id}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', `Player ${endpoint}d successfully`);
      fetchPlayerDetail();
    } catch (error) {
      Alert.alert('Error', 'Failed to update player status');
    }
  };

  if (loading || !playerData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  const { player, matches, transactions, teams, stats } = playerData;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Player Profile</Text>
        <TouchableOpacity onPress={() => {}} style={styles.editButton}>
          <Ionicons name="create-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Player Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{player.name?.[0] || 'U'}</Text>
          </View>
          <Text style={styles.playerName}>{player.name || 'Unknown'}</Text>
          <Text style={styles.playerPhone}>{player.phone}</Text>
          <View style={styles.roleContainer}>
            <Text style={styles.roleChip}>{player.playing_role || 'N/A'}</Text>
            <Text style={[styles.statusChip, player.is_active ? styles.activeChip : styles.inactiveChip]}>
              {player.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>AED {player.wallet_balance.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Balance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.matches_played}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{(stats.win_rate * 100).toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleActivateDeactivate}>
              <Ionicons 
                name={player.is_active ? "close-circle" : "checkmark-circle"} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.actionButtonText}>
                {player.is_active ? 'Deactivate' : 'Activate'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {['overview', 'matches', 'transactions', 'teams'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'overview' && (
            <View>
              <Text style={styles.sectionTitle}>Performance Stats</Text>
              <View style={styles.card}>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Impact Score</Text>
                  <Text style={styles.statRowValue}>{stats.impact_score.toFixed(1)}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Reliability Score</Text>
                  <Text style={styles.statRowValue}>{stats.reliability_score.toFixed(1)}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Total Spent</Text>
                  <Text style={styles.statRowValue}>AED {player.total_spent.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'matches' && (
            <View>
              <Text style={styles.sectionTitle}>Match History ({matches.length})</Text>
              {matches.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No matches yet</Text>
                </View>
              ) : (
                matches.map((match: any) => (
                  <View key={match.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{match.title}</Text>
                    <Text style={styles.cardSubtitle}>{new Date(match.date).toLocaleDateString()}</Text>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === 'transactions' && (
            <View>
              <Text style={styles.sectionTitle}>Recent Transactions ({transactions.length})</Text>
              {transactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No transactions yet</Text>
                </View>
              ) : (
                transactions.map((txn: any) => (
                  <View key={txn.id} style={styles.card}>
                    <View style={styles.transactionRow}>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.cardTitle}>{txn.description}</Text>
                        <Text style={styles.cardSubtitle}>
                          {new Date(txn.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={[styles.transactionAmount, txn.amount > 0 ? styles.credit : styles.debit]}>
                        {txn.amount > 0 ? '+' : ''}AED {Math.abs(txn.amount).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === 'teams' && (
            <View>
              <Text style={styles.sectionTitle}>Teams ({teams.length})</Text>
              {teams.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Not part of any team</Text>
                </View>
              ) : (
                teams.map((team: any) => (
                  <View key={team.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{team.name}</Text>
                    <Text style={styles.cardSubtitle}>{team.player_ids?.length || 0} members</Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  editButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#1e293b',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4ade80',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#000',
    fontSize: 32,
    fontWeight: 'bold',
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  playerPhone: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  roleChip: {
    fontSize: 12,
    color: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusChip: {
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeChip: {
    color: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  inactiveChip: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#334155',
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#4ade80',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  statRowLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  statRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  credit: {
    color: '#4ade80',
  },
  debit: {
    color: '#ef4444',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
  },
});