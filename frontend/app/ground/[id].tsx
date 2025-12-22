import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Card, Button, LoadingScreen } from '../../src/components';
import { groundAPI, walletAPI } from '../../src/services/api';
import { Ground, GroundSlot } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';

export default function GroundDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  
  const [ground, setGround] = useState<Ground | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<GroundSlot | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchGround = async () => {
    try {
      const response = await groundAPI.getGround(id);
      setGround(response.data);
      // Set default selected date
      if (response.data.slots && response.data.slots.length > 0) {
        const dates = [...new Set(response.data.slots.map((s: GroundSlot) => s.date))];
        setSelectedDate(dates[0] as string);
      }
    } catch (error) {
      console.error('Error fetching ground:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGround();
  }, [id]);

  const handleBookSlot = async () => {
    if (!selectedSlot) return;
    
    if ((user?.wallet_balance || 0) < selectedSlot.price) {
      Alert.alert(
        'Insufficient Balance',
        `You need AED ${selectedSlot.price.toFixed(2)} but only have AED ${(user?.wallet_balance || 0).toFixed(2)}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Top Up', onPress: () => router.push('/wallet/topup') },
        ]
      );
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Book ${ground?.name}\n${selectedSlot.date} | ${selectedSlot.start_time} - ${selectedSlot.end_time}\n\nCost: AED ${selectedSlot.price.toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Now',
          onPress: async () => {
            setBookingLoading(true);
            try {
              await groundAPI.bookSlot(id, selectedSlot.id);
              
              // Update user balance
              const newBalance = (user?.wallet_balance || 0) - selectedSlot.price;
              if (user) {
                setUser({ ...user, wallet_balance: newBalance });
              }
              
              Alert.alert(
                'Booking Confirmed!',
                `You have successfully booked ${ground?.name} for ${selectedSlot.date} at ${selectedSlot.start_time}`,
                [{ text: 'OK', onPress: () => fetchGround() }]
              );
              setSelectedSlot(null);
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.detail || 'Failed to book slot');
            } finally {
              setBookingLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingScreen message="Loading ground..." />;
  }

  if (!ground) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Ground not found</Text>
      </SafeAreaView>
    );
  }

  // Get unique dates
  const dates = [...new Set(ground.slots?.map(s => s.date) || [])];
  // Filter slots by selected date
  const filteredSlots = ground.slots?.filter(s => s.date === selectedDate) || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ground Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Ground Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.groundHeader}>
            <View style={styles.groundIcon}>
              <Ionicons 
                name={ground.type === 'indoor' ? 'home' : 'sunny'} 
                size={40} 
                color={COLORS.primary} 
              />
            </View>
            <View style={styles.groundInfo}>
              <Text style={styles.groundName}>{ground.name}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color={COLORS.textMuted} />
                <Text style={styles.groundLocation}>{ground.location}</Text>
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color={COLORS.gold} />
                <Text style={styles.ratingText}>{ground.rating.toFixed(1)}</Text>
                <Text style={styles.bookingsText}>({ground.total_bookings} bookings)</Text>
              </View>
            </View>
          </View>

          <Text style={styles.description}>{ground.description}</Text>

          {/* Tags */}
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: COLORS.primary + '20' }]}>
              <Text style={[styles.tagText, { color: COLORS.primary }]}>
                {ground.type === 'indoor' ? 'Indoor' : 'Outdoor'}
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: COLORS.info + '20' }]}>
              <Text style={[styles.tagText, { color: COLORS.info }]}>
                {ground.turf_type}
              </Text>
            </View>
            {ground.has_lighting && (
              <View style={[styles.tag, { backgroundColor: COLORS.warning + '20' }]}>
                <Ionicons name="flash" size={12} color={COLORS.warning} />
                <Text style={[styles.tagText, { color: COLORS.warning }]}>Floodlights</Text>
              </View>
            )}
            {ground.has_parking && (
              <View style={[styles.tag, { backgroundColor: COLORS.success + '20' }]}>
                <Ionicons name="car" size={12} color={COLORS.success} />
                <Text style={[styles.tagText, { color: COLORS.success }]}>Parking</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Amenities */}
        <Card style={styles.amenitiesCard}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {ground.amenities?.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Price */}
        <Card style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base Price</Text>
            <Text style={styles.priceValue}>AED {ground.price_per_hour}/hour</Text>
          </View>
          <View style={styles.walletRow}>
            <Ionicons name="wallet" size={20} color={COLORS.primary} />
            <Text style={styles.walletText}>Your Balance: AED {(user?.wallet_balance || 0).toFixed(2)}</Text>
          </View>
        </Card>

        {/* Available Slots */}
        <View style={styles.slotsSection}>
          <Text style={styles.sectionTitle}>Available Slots</Text>
          
          {/* Date Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateTabs}>
            {dates.map((date) => (
              <TouchableOpacity
                key={date}
                style={[styles.dateTab, selectedDate === date && styles.dateTabActive]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dateTabText, selectedDate === date && styles.dateTabTextActive]}>
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Slots Grid */}
          <View style={styles.slotsGrid}>
            {filteredSlots.length > 0 ? (
              filteredSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slotCard,
                    !slot.is_available && styles.slotUnavailable,
                    selectedSlot?.id === slot.id && styles.slotSelected,
                  ]}
                  onPress={() => slot.is_available && setSelectedSlot(slot)}
                  disabled={!slot.is_available}
                >
                  <Text style={[
                    styles.slotTime,
                    !slot.is_available && styles.slotTimeUnavailable,
                    selectedSlot?.id === slot.id && styles.slotTimeSelected,
                  ]}>
                    {slot.start_time} - {slot.end_time}
                  </Text>
                  <Text style={[
                    styles.slotPrice,
                    !slot.is_available && styles.slotPriceUnavailable,
                    selectedSlot?.id === slot.id && styles.slotPriceSelected,
                  ]}>
                    AED {slot.price}
                  </Text>
                  {!slot.is_available && (
                    <Text style={styles.bookedText}>Booked</Text>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noSlotsText}>No slots available for this date</Text>
            )}
          </View>
        </View>

        {/* Book Button */}
        {selectedSlot && (
          <Card style={styles.bookingCard}>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingLabel}>Selected Slot</Text>
              <Text style={styles.bookingTime}>
                {selectedSlot.date} | {selectedSlot.start_time} - {selectedSlot.end_time}
              </Text>
              <Text style={styles.bookingPrice}>AED {selectedSlot.price.toFixed(2)}</Text>
            </View>
            <Button
              title="Book Now"
              onPress={handleBookSlot}
              loading={bookingLoading}
              fullWidth
              size="lg"
            />
          </Card>
        )}
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
  infoCard: {
    marginBottom: SPACING.md,
  },
  groundHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  groundIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  groundInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  groundName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  groundLocation: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gold,
  },
  bookingsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  tagText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  amenitiesCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '50%',
    marginBottom: SPACING.sm,
  },
  amenityText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  priceCard: {
    marginBottom: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  priceLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  priceValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  walletText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  slotsSection: {
    marginBottom: SPACING.lg,
  },
  dateTabs: {
    marginBottom: SPACING.md,
  },
  dateTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  dateTabActive: {
    backgroundColor: COLORS.primary,
  },
  dateTabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  dateTabTextActive: {
    color: COLORS.text,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  slotCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  slotUnavailable: {
    opacity: 0.5,
    backgroundColor: COLORS.backgroundLight,
  },
  slotSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  slotTime: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  slotTimeUnavailable: {
    color: COLORS.textMuted,
  },
  slotTimeSelected: {
    color: COLORS.primary,
  },
  slotPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  slotPriceUnavailable: {
    color: COLORS.textMuted,
  },
  slotPriceSelected: {
    color: COLORS.primary,
  },
  bookedText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: 4,
  },
  noSlotsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  bookingCard: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary + '30',
  },
  bookingInfo: {
    marginBottom: SPACING.md,
  },
  bookingLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  bookingTime: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 4,
  },
  bookingPrice: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 4,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
