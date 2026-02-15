import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { StatusBar } from 'expo-status-bar';
import { DS_COLORS, DS_SPACING, DS_RADIUS } from '../../src/components/DesignSystem';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/profile/edit')}>
          <Ionicons name="create-outline" size={24} color={DS_COLORS.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {[
            { icon: 'person-outline', label: 'Edit Profile', route: '/profile/edit' },
            { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
            { icon: 'shield-checkmark-outline', label: 'Privacy & Security', route: '/profile/settings' },
            { icon: 'help-circle-outline', label: 'Help & Support', route: '/profile/settings' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={() => router.push(item.route as any)}>
              <View style={styles.menuIconBg}>
                <Ionicons name={item.icon as any} size={20} color={DS_COLORS.primary} />
              </View>
              <Text style={styles.menuText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={DS_COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={DS_COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: DS_SPACING.lg, paddingVertical: DS_SPACING.lg, backgroundColor: DS_COLORS.surface, borderBottomWidth: 1, borderBottomColor: DS_COLORS.borderLight },
  headerTitle: { fontSize: 28, fontWeight: '900', color: DS_COLORS.text },
  editButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: DS_COLORS.primaryGhost, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: DS_COLORS.border },
  scrollView: { flex: 1 },
  scrollContent: { padding: DS_SPACING.lg },
  profileCard: { backgroundColor: DS_COLORS.surface, borderRadius: DS_RADIUS.xl, padding: DS_SPACING.xl, alignItems: 'center', marginBottom: DS_SPACING.lg, borderWidth: 1, borderColor: DS_COLORS.borderLight },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: DS_COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: DS_SPACING.md },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  userName: { fontSize: 24, fontWeight: '800', color: DS_COLORS.text, marginBottom: 4 },
  userPhone: { fontSize: 14, color: DS_COLORS.textSecondary, marginBottom: DS_SPACING.md },
  roleBadge: { backgroundColor: DS_COLORS.primaryGhost, paddingHorizontal: 16, paddingVertical: 6, borderRadius: DS_RADIUS.md },
  roleText: { fontSize: 12, color: DS_COLORS.primary, fontWeight: '700', textTransform: 'uppercase' },
  section: { backgroundColor: DS_COLORS.surface, borderRadius: DS_RADIUS.xl, padding: DS_SPACING.md, marginBottom: DS_SPACING.lg, borderWidth: 1, borderColor: DS_COLORS.borderLight },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: DS_COLORS.text, paddingHorizontal: DS_SPACING.md, paddingVertical: DS_SPACING.sm, marginBottom: DS_SPACING.xs },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: DS_SPACING.md, borderRadius: DS_RADIUS.md },
  menuIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: DS_COLORS.primaryGhost, justifyContent: 'center', alignItems: 'center', marginRight: DS_SPACING.md },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: DS_COLORS.text },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', paddingVertical: DS_SPACING.md, borderRadius: DS_RADIUS.lg, gap: 8, borderWidth: 1, borderColor: '#FCA5A5' },
  logoutText: { fontSize: 16, fontWeight: '800', color: DS_COLORS.error },
});