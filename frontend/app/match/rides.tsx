import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Card, Button, LoadingScreen } from '../../src/components';
import { matchAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';

type RideStatus = 'none' | 'need_ride' | 'offering_ride';

interface RideInfo {
  user_id: string;
  user_name: string;
  status: RideStatus;
  seats_available: number;
  pickup_location?: string;
  matched_with?: string;
}

export default function RideCoordinationScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [myStatus, setMyStatus] = useState<RideStatus>('none');
  const [seats, setSeats] = useState('4');
  const [pickupLocation, setPickupLocation] = useState('');
  const [needRide, setNeedRide] = useState<RideInfo[]>([]);
  const [offeringRide, setOfferingRide] = useState<RideInfo[]>([]);

  const fetchRides = async () => {
    try {
      const response = await matchAPI.getRides(matchId);
      setNeedRide(response.data.need_ride || []);
      setOfferingRide(response.data.offering_ride || []);

      // Find my status
      const myRide = [...response.data.need_ride, ...response.data.offering_ride].find(
        (r: RideInfo) => r.user_id === user?.id
      );
      if (myRide) {
        setMyStatus(myRide.status);
        setSeats(myRide.seats_available?.toString() || '4');
        setPickupLocation(myRide.pickup_location || '');
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [matchId]);

  const handleUpdateRide = async (status: RideStatus) => {
    setActionLoading(true);
    try {
      await matchAPI.updateRide(
        matchId,
        status,
        status === 'offering_ride' ? parseInt(seats) : 0,
        pickupLocation || undefined
      );
      setMyStatus(status);
      fetchRides();
      Alert.alert('Success', status === 'none' ? 'Ride status cleared' : 'Ride status updated');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to update ride status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading ride info..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Coordination</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* My Ride Status */}
        <Card style={styles.myStatusCard}>
          <Text style={styles.sectionTitle}>Your Ride Status</Text>
          
          <View style={styles.statusOptions}>
            <TouchableOpacity
              style={[
                styles.statusOption,
                myStatus === 'need_ride' && styles.statusOptionActive,
              ]}
              onPress={() => setMyStatus('need_ride')}
            >
              <Ionicons
                name="hand-right"
                size={24}
                color={myStatus === 'need_ride' ? COLORS.warning : COLORS.textMuted}
              />
              <Text style={[
                styles.statusOptionText,
                myStatus === 'need_ride' && styles.statusOptionTextActive,
              ]}>
                Need Ride
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusOption,
                myStatus === 'offering_ride' && styles.statusOptionActive,
              ]}
              onPress={() => setMyStatus('offering_ride')}
            >
              <Ionicons
                name="car"
                size={24}
                color={myStatus === 'offering_ride' ? COLORS.success : COLORS.textMuted}
              />
              <Text style={[
                styles.statusOptionText,
                myStatus === 'offering_ride' && styles.statusOptionTextActive,
              ]}>
                Offering Ride
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusOption,
                myStatus === 'none' && styles.statusOptionActive,
              ]}
              onPress={() => setMyStatus('none')}
            >
              <Ionicons
                name="close-circle"
                size={24}
                color={myStatus === 'none' ? COLORS.textMuted : COLORS.textMuted}
              />
              <Text style={[
                styles.statusOptionText,
                myStatus === 'none' && styles.statusOptionTextActive,
              ]}>
                None
              </Text>
            </TouchableOpacity>
          </View>

          {myStatus === 'offering_ride' && (
            <View style={styles.offerDetails}>
              <View style={styles.seatsRow}>
                <Text style={styles.label}>Available Seats:</Text>
                <View style={styles.seatsControl}>
                  <TouchableOpacity
                    style={styles.seatsButton}
                    onPress={() => setSeats(Math.max(1, parseInt(seats) - 1).toString())}
                  >
                    <Ionicons name="remove" size={20} color={COLORS.text} />
                  </TouchableOpacity>
                  <Text style={styles.seatsValue}>{seats}</Text>
                  <TouchableOpacity
                    style={styles.seatsButton}
                    onPress={() => setSeats(Math.min(7, parseInt(seats) + 1).toString())}
                  >
                    <Ionicons name="add" size={20} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.label}>Pickup Location (optional):</Text>
              <TextInput
                style={styles.input}
                value={pickupLocation}
                onChangeText={setPickupLocation}
                placeholder="e.g., Dubai Marina Metro Station"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          )}

          {myStatus === 'need_ride' && (
            <View style={styles.offerDetails}>
              <Text style={styles.label}>Pickup Location (optional):</Text>
              <TextInput
                style={styles.input}
                value={pickupLocation}
                onChangeText={setPickupLocation}
                placeholder="Where can you be picked up?"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          )}

          <Button
            title="Update Status"
            onPress={() => handleUpdateRide(myStatus)}
            loading={actionLoading}
            fullWidth
            style={{ marginTop: SPACING.md }}
          />
        </Card>

        {/* Players Offering Rides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="car" size={18} color={COLORS.success} /> Offering Rides ({offeringRide.length})
          </Text>
          {offeringRide.length > 0 ? (
            offeringRide.map((ride) => (
              <Card key={ride.user_id} style={styles.rideCard}>
                <View style={styles.rideRow}>
                  <View style={styles.rideAvatar}>
                    <Ionicons name="car" size={20} color={COLORS.success} />
                  </View>
                  <View style={styles.rideInfo}>
                    <Text style={styles.rideName}>{ride.user_name}</Text>
                    <Text style={styles.rideDetails}>
                      {ride.seats_available} seats available
                    </Text>
                    {ride.pickup_location && (
                      <Text style={styles.rideLocation}>
                        <Ionicons name="location" size={12} color={COLORS.textMuted} />
                        {' '}{ride.pickup_location}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Text style={styles.emptyText}>No one offering rides yet</Text>
          )}
        </View>

        {/* Players Needing Rides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="hand-right" size={18} color={COLORS.warning} /> Need Rides ({needRide.length})
          </Text>
          {needRide.length > 0 ? (
            needRide.map((ride) => (
              <Card key={ride.user_id} style={styles.rideCard}>
                <View style={styles.rideRow}>
                  <View style={[styles.rideAvatar, { backgroundColor: COLORS.warning + '20' }]}>
                    <Ionicons name="hand-right" size={20} color={COLORS.warning} />
                  </View>
                  <View style={styles.rideInfo}>
                    <Text style={styles.rideName}>{ride.user_name}</Text>
                    {ride.pickup_location && (
                      <Text style={styles.rideLocation}>
                        <Ionicons name="location" size={12} color={COLORS.textMuted} />
                        {' '}{ride.pickup_location}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Text style={styles.emptyText}>No one needs a ride</Text>
          )}
        </View>
      </ScrollView>
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
  myStatusCard: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statusOption: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  statusOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  statusOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  offerDetails: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  seatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  seatsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  seatsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatsValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  rideCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
  },
  rideRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rideAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  rideInfo: {
    flex: 1,
  },
  rideName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  rideDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    marginTop: 2,
  },
  rideLocation: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
});
