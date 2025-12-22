import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Card, Button, Input } from '../../src/components';
import { groundAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';

const GROUND_TYPES = [
  { value: 'indoor', label: 'Indoor', icon: 'home' },
  { value: 'outdoor', label: 'Outdoor', icon: 'sunny' },
];

const TURF_TYPES = [
  { value: 'natural', label: 'Natural Grass' },
  { value: 'artificial', label: 'Artificial Turf' },
  { value: 'matting', label: 'Matting' },
];

const AMENITIES = [
  'Changing Rooms',
  'Scoreboard',
  'Practice Nets',
  'Parking',
  'Floodlights',
  'Pavilion',
  'Washrooms',
  'Refreshments',
  'Seating',
  'Equipment Rental',
];

export default function CreateGroundScreen() {
  const router = useRouter();
  const { setUser, user } = useAuthStore();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [groundType, setGroundType] = useState<'indoor' | 'outdoor'>('outdoor');
  const [turfType, setTurfType] = useState('natural');
  const [hasLighting, setHasLighting] = useState(false);
  const [hasParking, setHasParking] = useState(true);
  const [pricePerHour, setPricePerHour] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [cancellationHours, setCancellationHours] = useState('24');
  const [cancellationFee, setCancellationFee] = useState('20');
  const [loading, setLoading] = useState(false);

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !location.trim() || !pricePerHour) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await groundAPI.create({
        name: name.trim(),
        location: location.trim(),
        description: description.trim() || null,
        type: groundType,
        turf_type: turfType,
        has_lighting: hasLighting,
        has_parking: hasParking,
        price_per_hour: parseFloat(pricePerHour),
        amenities: selectedAmenities,
        cancellation_hours: parseInt(cancellationHours),
        cancellation_fee_percent: parseFloat(cancellationFee),
      });

      // Update user role to ground_owner
      if (user) {
        setUser({ ...user, role: 'ground_owner' as any });
      }

      Alert.alert(
        'Ground Created!',
        'Your ground has been registered. Now add available slots for booking.',
        [
          {
            text: 'Add Slots',
            onPress: () => router.replace({ pathname: '/ground/manage-slots', params: { groundId: response.data.id } }),
          },
          {
            text: 'Later',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to create ground');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Register Ground</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <Input
              label="Ground Name *"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Dubai Sports City Cricket Ground"
              icon={<Ionicons name="location" size={20} color={COLORS.textMuted} />}
            />
            <Input
              label="Location *"
              value={location}
              onChangeText={setLocation}
              placeholder="Full address"
              icon={<Ionicons name="map" size={20} color={COLORS.textMuted} />}
            />
            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your ground..."
              multiline
              numberOfLines={3}
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Ground Type</Text>
            <View style={styles.typeRow}>
              {GROUND_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeCard,
                    groundType === type.value && styles.typeCardActive,
                  ]}
                  onPress={() => setGroundType(type.value as any)}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={32}
                    color={groundType === type.value ? COLORS.primary : COLORS.textMuted}
                  />
                  <Text style={[
                    styles.typeLabel,
                    groundType === type.value && styles.typeLabelActive,
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Turf Type</Text>
            <View style={styles.turfRow}>
              {TURF_TYPES.map((turf) => (
                <TouchableOpacity
                  key={turf.value}
                  style={[
                    styles.turfChip,
                    turfType === turf.value && styles.turfChipActive,
                  ]}
                  onPress={() => setTurfType(turf.value)}
                >
                  <Text style={[
                    styles.turfText,
                    turfType === turf.value && styles.turfTextActive,
                  ]}>
                    {turf.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Facilities</Text>
            <View style={styles.switchRow}>
              <View style={styles.switchItem}>
                <Ionicons name="flash" size={20} color={hasLighting ? COLORS.warning : COLORS.textMuted} />
                <Text style={styles.switchLabel}>Floodlights</Text>
              </View>
              <Switch
                value={hasLighting}
                onValueChange={setHasLighting}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
                thumbColor={hasLighting ? COLORS.primary : COLORS.textMuted}
              />
            </View>
            <View style={styles.switchRow}>
              <View style={styles.switchItem}>
                <Ionicons name="car" size={20} color={hasParking ? COLORS.success : COLORS.textMuted} />
                <Text style={styles.switchLabel}>Parking Available</Text>
              </View>
              <Switch
                value={hasParking}
                onValueChange={setHasParking}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
                thumbColor={hasParking ? COLORS.primary : COLORS.textMuted}
              />
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {AMENITIES.map((amenity) => (
                <TouchableOpacity
                  key={amenity}
                  style={[
                    styles.amenityChip,
                    selectedAmenities.includes(amenity) && styles.amenityChipActive,
                  ]}
                  onPress={() => toggleAmenity(amenity)}
                >
                  <Text style={[
                    styles.amenityText,
                    selectedAmenities.includes(amenity) && styles.amenityTextActive,
                  ]}>
                    {amenity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            <Input
              label="Price per Hour (AED) *"
              value={pricePerHour}
              onChangeText={setPricePerHour}
              placeholder="e.g., 800"
              keyboardType="numeric"
              icon={<Ionicons name="cash" size={20} color={COLORS.textMuted} />}
            />
            <View style={styles.pricingRow}>
              <View style={styles.pricingItem}>
                <Text style={styles.pricingLabel}>Cancellation Window</Text>
                <View style={styles.pricingInput}>
                  <Input
                    value={cancellationHours}
                    onChangeText={setCancellationHours}
                    keyboardType="numeric"
                    style={{ marginBottom: 0 }}
                  />
                  <Text style={styles.pricingUnit}>hours</Text>
                </View>
              </View>
              <View style={styles.pricingItem}>
                <Text style={styles.pricingLabel}>Cancellation Fee</Text>
                <View style={styles.pricingInput}>
                  <Input
                    value={cancellationFee}
                    onChangeText={setCancellationFee}
                    keyboardType="numeric"
                    style={{ marginBottom: 0 }}
                  />
                  <Text style={styles.pricingUnit}>%</Text>
                </View>
              </View>
            </View>
          </Card>

          <Button
            title="Register Ground"
            onPress={handleCreate}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginVertical: SPACING.lg }}
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
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  typeLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  typeLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  turfRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  turfChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  turfChipActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  turfText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  turfTextActive: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  switchLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  amenityChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  amenityChipActive: {
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
  },
  amenityText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  amenityTextActive: {
    color: COLORS.success,
    fontWeight: '500',
  },
  pricingRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  pricingItem: {
    flex: 1,
  },
  pricingLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  pricingInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pricingUnit: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
});
