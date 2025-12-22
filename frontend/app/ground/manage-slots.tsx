import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Card, Button, LoadingScreen } from '../../src/components';
import { groundAPI } from '../../src/services/api';
import { Ground, GroundSlot } from '../../src/types';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ManageSlotsScreen() {
  const { groundId } = useLocalSearchParams<{ groundId: string }>();
  const router = useRouter();

  const [ground, setGround] = useState<Ground | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  // Slot creation form
  const [slotDate, setSlotDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('09:00');
  const [price, setPrice] = useState('');

  const fetchGround = async () => {
    try {
      const response = await groundAPI.getGround(groundId);
      setGround(response.data);
      // Set default price from ground
      if (response.data.price_per_hour && !price) {
        setPrice((response.data.price_per_hour * 3).toString()); // 3 hour slot default
      }
    } catch (error) {
      console.error('Error fetching ground:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGround();
  }, [groundId]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 21; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const handleAddSlot = async () => {
    if (!price) {
      Alert.alert('Error', 'Please enter a price');
      return;
    }

    setCreating(true);
    try {
      const dateStr = slotDate.toISOString().split('T')[0];
      const newSlot = {
        id: `slot-${Date.now()}`,
        date: dateStr,
        start_time: startTime,
        end_time: endTime,
        price: parseFloat(price),
        is_available: true,
      };

      await groundAPI.addSlots(groundId, [newSlot]);
      setModalVisible(false);
      fetchGround();
      Alert.alert('Success', 'Slot added successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to add slot');
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveSlot = async (slotId: string) => {
    Alert.alert(
      'Remove Slot',
      'Are you sure you want to remove this slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await groundAPI.removeSlot(groundId, slotId);
              fetchGround();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.detail || 'Failed to remove slot');
            }
          },
        },
      ]
    );
  };

  const handleBulkAdd = async () => {
    Alert.alert(
      'Add Week Slots',
      'This will add morning and evening slots for the next 7 days. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Slots',
          onPress: async () => {
            setCreating(true);
            try {
              const slots = [];
              const basePrice = ground?.price_per_hour || 500;
              
              for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                
                // Morning slot
                slots.push({
                  id: `slot-${Date.now()}-${i}-m`,
                  date: dateStr,
                  start_time: '06:00',
                  end_time: '09:00',
                  price: basePrice * 3,
                  is_available: true,
                });
                
                // Afternoon slot
                slots.push({
                  id: `slot-${Date.now()}-${i}-a`,
                  date: dateStr,
                  start_time: '16:00',
                  end_time: '19:00',
                  price: basePrice * 3,
                  is_available: true,
                });
                
                // Evening slot
                slots.push({
                  id: `slot-${Date.now()}-${i}-e`,
                  date: dateStr,
                  start_time: '19:00',
                  end_time: '22:00',
                  price: basePrice * 3.5, // Evening premium
                  is_available: true,
                });
              }

              await groundAPI.addSlots(groundId, slots);
              fetchGround();
              Alert.alert('Success', `Added ${slots.length} slots for the next 7 days`);
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.detail || 'Failed to add slots');
            } finally {
              setCreating(false);
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

  // Group slots by date
  const slotsByDate: Record<string, GroundSlot[]> = {};
  ground.slots?.forEach(slot => {
    if (!slotsByDate[slot.date]) {
      slotsByDate[slot.date] = [];
    }
    slotsByDate[slot.date].push(slot);
  });

  // Sort dates
  const sortedDates = Object.keys(slotsByDate).sort();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Slots</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ground Info */}
        <Card style={styles.groundCard}>
          <Text style={styles.groundName}>{ground.name}</Text>
          <Text style={styles.groundLocation}>{ground.location}</Text>
          <Text style={styles.basePrice}>Base: AED {ground.price_per_hour}/hour</Text>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            title="Add Single Slot"
            onPress={() => setModalVisible(true)}
            variant="outline"
            size="sm"
            icon={<Ionicons name="add" size={18} color={COLORS.primary} />}
          />
          <Button
            title="Add Week Slots"
            onPress={handleBulkAdd}
            variant="primary"
            size="sm"
            loading={creating}
            icon={<Ionicons name="calendar" size={18} color={COLORS.text} />}
          />
        </View>

        {/* Slots by Date */}
        {sortedDates.length > 0 ? (
          sortedDates.map(date => (
            <View key={date} style={styles.dateSection}>
              <Text style={styles.dateTitle}>
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </Text>
              <View style={styles.slotsGrid}>
                {slotsByDate[date]
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map(slot => (
                    <View
                      key={slot.id}
                      style={[
                        styles.slotCard,
                        !slot.is_available && styles.slotBooked,
                      ]}
                    >
                      <View style={styles.slotTime}>
                        <Ionicons name="time" size={14} color={slot.is_available ? COLORS.primary : COLORS.textMuted} />
                        <Text style={[styles.slotTimeText, !slot.is_available && styles.slotTextMuted]}>
                          {slot.start_time} - {slot.end_time}
                        </Text>
                      </View>
                      <Text style={[styles.slotPrice, !slot.is_available && styles.slotTextMuted]}>
                        AED {slot.price}
                      </Text>
                      {slot.is_available ? (
                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => handleRemoveSlot(slot.id)}
                        >
                          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.bookedBadge}>
                          <Text style={styles.bookedText}>Booked</Text>
                        </View>
                      )}
                    </View>
                  ))}
              </View>
            </View>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No slots available</Text>
            <Text style={styles.emptySubtext}>Add slots to start accepting bookings</Text>
          </Card>
        )}
      </ScrollView>

      {/* Add Slot Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Slot</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar" size={20} color={COLORS.textMuted} />
              <Text style={styles.dateText}>
                {slotDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={slotDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setSlotDate(selectedDate);
                }}
              />
            )}

            <View style={styles.timeRow}>
              <View style={styles.timeSelect}>
                <Text style={styles.timeLabel}>Start Time</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {generateTimeSlots().map(time => (
                    <TouchableOpacity
                      key={time}
                      style={[styles.timeChip, startTime === time && styles.timeChipActive]}
                      onPress={() => setStartTime(time)}
                    >
                      <Text style={[styles.timeChipText, startTime === time && styles.timeChipTextActive]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.timeSelect}>
                <Text style={styles.timeLabel}>End Time</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {generateTimeSlots().map(time => (
                    <TouchableOpacity
                      key={time}
                      style={[styles.timeChip, endTime === time && styles.timeChipActive]}
                      onPress={() => setEndTime(time)}
                    >
                      <Text style={[styles.timeChipText, endTime === time && styles.timeChipTextActive]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.priceInput}>
              <Text style={styles.priceLabel}>Price (AED)</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="e.g., 2400"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
            </View>

            <Button
              title="Add Slot"
              onPress={handleAddSlot}
              loading={creating}
              fullWidth
            />
          </View>
        </View>
      </Modal>
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
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  groundCard: {
    marginBottom: SPACING.md,
  },
  groundName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  groundLocation: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  basePrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  dateSection: {
    marginBottom: SPACING.lg,
  },
  dateTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  slotsGrid: {
    gap: SPACING.sm,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  slotBooked: {
    backgroundColor: COLORS.backgroundLight,
    borderLeftColor: COLORS.textMuted,
  },
  slotTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  slotTimeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  slotPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: SPACING.md,
  },
  slotTextMuted: {
    color: COLORS.textMuted,
  },
  removeBtn: {
    padding: SPACING.xs,
  },
  bookedBadge: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  bookedText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  dateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  timeRow: {
    marginBottom: SPACING.md,
  },
  timeSelect: {
    marginBottom: SPACING.sm,
  },
  timeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  timeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.xs,
  },
  timeChipActive: {
    backgroundColor: COLORS.primary,
  },
  timeChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  timeChipTextActive: {
    color: COLORS.text,
    fontWeight: '500',
  },
  priceInput: {
    marginBottom: SPACING.md,
  },
  priceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
