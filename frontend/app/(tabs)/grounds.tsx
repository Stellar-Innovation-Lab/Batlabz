import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { groundAPI } from '../../src/services/api';
import { StatusBar } from 'expo-status-bar';
import { DS_COLORS, DS_SPACING, DS_RADIUS } from '../../src/components/DesignSystem';

export default function GroundsScreen() {
  const router = useRouter();
  const [grounds, setGrounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGrounds = async () => {
    try {
      const res = await groundAPI.getGrounds();
      setGrounds(res.data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchGrounds(); }, []);

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={DS_COLORS.primary} /><Text style={styles.loadingText}>Loading grounds...</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View><Text style={styles.headerTitle}>Grounds</Text><Text style={styles.headerSubtitle}>{grounds.length} available venues</Text></View>
        <TouchableOpacity style={styles.filterButton}><Ionicons name="filter" size={24} color={DS_COLORS.primary} /></TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchGrounds(); }} tintColor={DS_COLORS.primary} />}>
        {grounds.map((ground) => (
          <TouchableOpacity key={ground.id} style={styles.groundCard} onPress={() => router.push(`/ground/${ground.id}`)}>
            <View style={styles.groundHeader}>
              <LinearGradient colors={[DS_COLORS.primary, DS_COLORS.primaryDark]} style={styles.groundIcon}>
                <Ionicons name="location" size={24} color="#fff" />
              </LinearGradient>
              <View style={styles.groundInfo}>
                <Text style={styles.groundName}>{ground.name}</Text>
                <Text style={styles.groundLocation}>{ground.location}</Text>
              </View>
            </View>
            <View style={styles.groundMeta}>
              <View style={styles.metaChip}><Ionicons name="cash" size={12} color={DS_COLORS.textMuted} /><Text style={styles.metaText}>AED {ground.price_per_hour}/hr</Text></View>
              <View style={styles.metaChip}><Ionicons name="star" size={12} color="#F59E0B" /><Text style={styles.metaText}>{ground.rating || 4.5}</Text></View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.background },
  loadingContainer: { flex: 1, backgroundColor: DS_COLORS.background, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: DS_SPACING.md, fontSize: 16, color: DS_COLORS.textSecondary, fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: DS_SPACING.lg, paddingVertical: DS_SPACING.lg, backgroundColor: DS_COLORS.surface, borderBottomWidth: 1, borderBottomColor: DS_COLORS.borderLight },
  headerTitle: { fontSize: 28, fontWeight: '900', color: DS_COLORS.text, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: DS_COLORS.textSecondary, fontWeight: '500' },
  filterButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: DS_COLORS.primaryGhost, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: DS_COLORS.border },
  scrollView: { flex: 1 },
  scrollContent: { padding: DS_SPACING.lg },
  groundCard: { backgroundColor: DS_COLORS.surface, borderRadius: DS_RADIUS.xl, padding: DS_SPACING.lg, marginBottom: DS_SPACING.md, borderWidth: 1, borderColor: DS_COLORS.borderLight, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 } },
  groundHeader: { flexDirection: 'row', marginBottom: DS_SPACING.md },
  groundIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: DS_SPACING.md },
  groundInfo: { flex: 1 },
  groundName: { fontSize: 18, fontWeight: '800', color: DS_COLORS.text, marginBottom: 4 },
  groundLocation: { fontSize: 14, color: DS_COLORS.textSecondary, fontWeight: '500' },
  groundMeta: { flexDirection: 'row', gap: 12 },
  metaChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: DS_COLORS.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: DS_RADIUS.md, gap: 6, borderWidth: 1, borderColor: DS_COLORS.borderLight },
  metaText: { fontSize: 13, color: DS_COLORS.textMuted, fontWeight: '600' },
});