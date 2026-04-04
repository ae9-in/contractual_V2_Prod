import React, { useState } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, TextInput, 
  Switch, StyleSheet, ActivityIndicator, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ChevronLeft, User, Bell, Shield, 
  Wallet, LogOut, Save, Trash2 
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preferences state
  const [showProfile, setShowProfile] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.patch('/api/freelancer/profile', { name });
      Alert.alert('Success', 'Settings updated successfully.');
    } catch (error) {
      console.error('Update settings error:', error);
      Alert.alert('Error', 'Failed to update settings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: async () => {
          await clearAuth();
          router.replace('/auth/signin' as any);
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#1c2b2c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Account & Preferences</Text>
          <Text style={styles.introSub}>Manage your freelancer identity and privacy</Text>
        </View>

        {/* Account Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <User size={20} color="#6d9c9f" />
            <Text style={styles.cardTitle}>Account Details</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={[styles.inputGroup, { marginBottom: 0 }]}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[styles.input, styles.disabledInput]}>
              <Text style={styles.disabledInputText}>{user?.email}</Text>
            </View>
            <Text style={styles.inputHint}>Email cannot be changed.</Text>
          </View>
        </View>

        {/* Preferences Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Shield size={20} color="#6d9c9f" />
            <Text style={styles.cardTitle}>Preferences</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Profile Visibility</Text>
              <Text style={styles.settingSub}>Show profile in search results</Text>
            </View>
            <Switch
              value={showProfile}
              onValueChange={setShowProfile}
              trackColor={{ false: '#e2e8f0', true: '#6d9c9f' }}
              thumbColor="white"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Text style={styles.settingSub}>Updates about gigs and messages</Text>
            </View>
            <Switch
              value={emailNotifs}
              onValueChange={setEmailNotifs}
              trackColor={{ false: '#e2e8f0', true: '#6d9c9f' }}
              thumbColor="white"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Marketing Emails</Text>
              <Text style={styles.settingSub}>Newsletters and platform tips</Text>
            </View>
            <Switch
              value={marketingEmails}
              onValueChange={setMarketingEmails}
              trackColor={{ false: '#e2e8f0', true: '#6d9c9f' }}
              thumbColor="white"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, isSubmitting && styles.disabledButton]} 
          onPress={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Save size={18} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Danger Zone */}
        <View style={{ marginTop: 40, marginBottom: 40 }}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color="#ef4444" style={{ marginRight: 10 }} />
            <Text style={styles.signOutText}>Sign Out of Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.signOutButton, { marginTop: 10, borderColor: '#fecaca' }]}>
            <Trash2 size={20} color="#ef4444" style={{ marginRight: 10 }} />
            <Text style={styles.signOutText}>Request Account Deletion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1c2b2c',
  },
  scrollContent: {
    padding: 24,
  },
  intro: {
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  introSub: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#1c2b2c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1c2b2c',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  disabledInput: {
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  disabledInputText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '700',
  },
  inputHint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1c2b2c',
  },
  settingSub: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  saveButton: {
    height: 56,
    backgroundColor: '#0f172a',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ef4444',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingLeft: 4,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 18,
    padding: 16,
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '800',
  },
});
