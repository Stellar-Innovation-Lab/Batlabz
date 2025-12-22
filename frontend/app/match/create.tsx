import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/components/theme';
import { Button, Input, Card } from '../../src/components';
import { matchAPI, teamAPI } from '../../src/services/api';
import { Team, MatchFormat } from '../../src/types';

const FORMATS = [
  { value: MatchFormat.T10, label: 'T10', desc: '10 overs per side' },
  { value: MatchFormat.T20, label: 'T20', desc: '20 overs per side' },
  { value: MatchFormat.NETS, label: 'Nets', desc: 'Practice session' },
  { value: MatchFormat.FRIENDLY, label: 'Friendly', desc: 'Casual match' },
];

export default function CreateMatchScreen() {
  const router = useRouter();
  const { teamId } = useLocalSearchParams<{ teamId?: string }>();
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>(teamId || '');
  const [title, setTitle] = useState('');
  const [matchDate, setMatchDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [format, setFormat] = useState<MatchFormat>(MatchFormat.T20);
  const [playerLimit, setPlayerLimit] = useState('22');
  const [totalCost, setTotalCost] = useState('');
  const [groundFee, setGroundFee] = useState('');
  const [umpireFee, setUmpireFee] = useState('');
  const [equipmentFee, setEquipmentFee] = useState('');
  const [miscFee, setMiscFee] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetchingTeams, setFetchingTeams] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  
  // Date/Time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');

  useEffect(() => {
    fetchTeams();
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setMatchDate(tomorrow);
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await teamAPI.getMyTeams();
      const captainTeams = response.data.filter((t: Team) => t.captain_id);
      setTeams(captainTeams);
      if (captainTeams.length > 0 && !selectedTeam) {
        setSelectedTeam(captainTeams[0].id);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setFetchingTeams(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
    if (selectedDate) {
      if (datePickerMode === 'date') {
        const newDate = new Date(selectedDate);
        newDate.setHours(matchDate.getHours(), matchDate.getMinutes());
        setMatchDate(newDate);
      } else {
        const newDate = new Date(matchDate);
        newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
        setMatchDate(newDate);
      }
    }
  };

  const showDateSelector = () => {
    setDatePickerMode('date');
    setShowDatePicker(true);
  };

  const showTimeSelector = () => {
    setDatePickerMode('time');
    setShowTimePicker(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCreate = async () => {
    if (!selectedTeam) {
      setError('Please select a team');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a match title');
      return;
    }
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await matchAPI.create(selectedTeam, {
        title: title.trim(),
        date: matchDate.toISOString(),
        location: location.trim(),
        format,
        player_limit: parseInt(playerLimit) || 22,
        total_cost: parseFloat(totalCost) || 0,
        cost_breakdown: {
          ground_fee: parseFloat(groundFee) || 0,
          umpire_fee: parseFloat(umpireFee) || 0,
          balls_equipment: parseFloat(equipmentFee) || 0,
          miscellaneous: parseFloat(miscFee) || 0,
        },
      });

      Alert.alert('Success', 'Match created successfully!');
      router.replace(`/match/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalFromBreakdown = () => {
    const total = (parseFloat(groundFee) || 0) + 
                  (parseFloat(umpireFee) || 0) + 
                  (parseFloat(equipmentFee) || 0) + 
                  (parseFloat(miscFee) || 0);
    setTotalCost(total.toString());
  };

  const perPlayerCost = totalCost && playerLimit ? 
    (parseFloat(totalCost) / parseInt(playerLimit)).toFixed(2) : '0.00';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Match</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]}>
          <Text style={[styles.progressText, step >= 1 && styles.progressTextActive]}>1</Text>
        </View>
        <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
        <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]}>
          <Text style={[styles.progressText, step >= 2 && styles.progressTextActive]}>2</Text>
        </View>
        <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
        <View style={[styles.progressStep, step >= 3 && styles.progressStepActive]}>
          <Text style={[styles.progressText, step >= 3 && styles.progressTextActive]}>3</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>Basic Information</Text>
              
              <Text style={styles.label}>Select Team</Text>
              {teams.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamScroll}>
                  {teams.map((team) => (
                    <TouchableOpacity
                      key={team.id}
                      style={[
                        styles.teamChip,
                        selectedTeam === team.id && styles.teamChipSelected,
                      ]}
                      onPress={() => setSelectedTeam(team.id)}
                    >
                      <Ionicons 
                        name="people" 
                        size={20} 
                        color={selectedTeam === team.id ? COLORS.primary : COLORS.textMuted} 
                      />
                      <Text style={[
                        styles.teamChipText,
                        selectedTeam === team.id && styles.teamChipTextSelected,
                      ]}>
                        {team.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <Card style={styles.noTeamCard}>
                  <Text style={styles.noTeamText}>You need to create a team first</Text>
                  <Button 
                    title="Create Team" 
                    onPress={() => router.push('/team/create')} 
                    variant="outline"
                    size="sm"
                  />
                </Card>
              )}

              <Input
                label="Match Title"
                placeholder="e.g. Weekend T20 Match"
                value={title}
                onChangeText={setTitle}
              />

              {/* Date Picker */}
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity style={styles.dateTimeButton} onPress={showDateSelector}>
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
                <Text style={styles.dateTimeText}>{formatDate(matchDate)}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>

              {/* Time Picker */}
              <Text style={styles.label}>Time</Text>
              <TouchableOpacity style={styles.dateTimeButton} onPress={showTimeSelector}>
                <Ionicons name="time" size={20} color={COLORS.primary} />
                <Text style={styles.dateTimeText}>{formatTime(matchDate)}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>

              {/* Date/Time Pickers */}
              {(showDatePicker || showTimePicker) && (
                <DateTimePicker
                  value={matchDate}
                  mode={datePickerMode}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}

              {Platform.OS === 'ios' && (showDatePicker || showTimePicker) && (
                <Button
                  title="Done"
                  onPress={() => { setShowDatePicker(false); setShowTimePicker(false); }}
                  variant="ghost"
                  size="sm"
                />
              )}

              <Input
                label="Location"
                placeholder="e.g. Dubai Sports City"
                value={location}
                onChangeText={setLocation}
              />

              <Button
                title="Next: Format & Cost"
                onPress={() => setStep(2)}
                fullWidth
                size="lg"
                disabled={!selectedTeam || !title || !location}
              />
            </View>
          )}

          {/* Step 2: Format & Players */}
          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>Match Format</Text>

              <View style={styles.formatGrid}>
                {FORMATS.map((f) => (
                  <TouchableOpacity
                    key={f.value}
                    style={[
                      styles.formatCard,
                      format === f.value && styles.formatCardSelected,
                    ]}
                    onPress={() => setFormat(f.value)}
                  >
                    <Text style={[
                      styles.formatLabel,
                      format === f.value && styles.formatLabelSelected,
                    ]}>
                      {f.label}
                    </Text>
                    <Text style={styles.formatDesc}>{f.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Player Limit"
                placeholder="22"
                value={playerLimit}
                onChangeText={setPlayerLimit}
                keyboardType="number-pad"
              />

              <View style={styles.buttonRow}>
                <Button
                  title="Back"
                  onPress={() => setStep(1)}
                  variant="outline"
                  style={styles.halfButton}
                />
                <Button
                  title="Next: Costs"
                  onPress={() => setStep(3)}
                  style={styles.halfButton}
                />
              </View>
            </View>
          )}

          {/* Step 3: Costs */}
          {step === 3 && (
            <View>
              <Text style={styles.stepTitle}>Cost Breakdown</Text>

              <Input
                label="Ground Fee (AED)"
                placeholder="0"
                value={groundFee}
                onChangeText={(v) => { setGroundFee(v); }}
                keyboardType="decimal-pad"
              />

              <Input
                label="Umpire Fee (AED)"
                placeholder="0"
                value={umpireFee}
                onChangeText={setUmpireFee}
                keyboardType="decimal-pad"
              />

              <Input
                label="Equipment/Balls (AED)"
                placeholder="0"
                value={equipmentFee}
                onChangeText={setEquipmentFee}
                keyboardType="decimal-pad"
              />

              <Input
                label="Miscellaneous (AED)"
                placeholder="0"
                value={miscFee}
                onChangeText={setMiscFee}
                keyboardType="decimal-pad"
              />

              <TouchableOpacity style={styles.calculateButton} onPress={calculateTotalFromBreakdown}>
                <Text style={styles.calculateText}>Calculate Total</Text>
              </TouchableOpacity>

              <Card style={styles.totalCard}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Cost</Text>
                  <Text style={styles.totalValue}>AED {parseFloat(totalCost || '0').toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.perPlayerLabel}>Per Player ({playerLimit} players)</Text>
                  <Text style={styles.perPlayerValue}>AED {perPlayerCost}</Text>
                </View>
              </Card>

              <Input
                label="Or Enter Total Directly (AED)"
                placeholder="0"
                value={totalCost}
                onChangeText={setTotalCost}
                keyboardType="decimal-pad"
              />

              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.buttonRow}>
                <Button
                  title="Back"
                  onPress={() => setStep(2)}
                  variant="outline"
                  style={styles.halfButton}
                />
                <Button
                  title="Create Match"
                  onPress={handleCreate}
                  loading={loading}
                  style={styles.halfButton}
                />
              </View>
            </View>
          )}
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  progressStepActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  progressTextActive: {
    color: COLORS.text,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  stepTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  teamScroll: {
    marginBottom: SPACING.lg,
  },
  teamChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  teamChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  teamChipText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  teamChipTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  noTeamCard: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
  },
  noTeamText: {
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  dateTimeText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  formatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  formatCard: {
    width: '48%',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formatCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  formatLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  formatLabelSelected: {
    color: COLORS.primary,
  },
  formatDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  halfButton: {
    flex: 1,
  },
  calculateButton: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.md,
  },
  calculateText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  totalCard: {
    backgroundColor: COLORS.primary + '15',
    marginBottom: SPACING.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  perPlayerLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  perPlayerValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
  error: {
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
});
