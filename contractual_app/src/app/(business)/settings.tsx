import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Switch, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft, User, Bell, Shield,
  CreditCard, LogOut, Save, Trash2, Building2
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase',
      letterSpacing: 1, marginBottom: 12, marginTop: 24, paddingHorizontal: 4 }}>
      {label}
    </Text>
  );
}

function SettingCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={{
      backgroundColor: 'white', borderRadius: 22, padding: 20, marginBottom: 4,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    }}>
      {children}
    </View>
  );
}

function SettingRow({
  label, subtitle, value, onChange, last = false,
}: {
  label: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void; last?: boolean;
}) {
  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#1c2b2c' }}>{label}</Text>
          {subtitle && <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '600', marginTop: 2 }}>{subtitle}</Text>}
        </View>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: '#e2e8f0', true: '#6d9c9f' }}
          thumbColor="white"
        />
      </View>
      {!last && <View style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 }} />}
    </>
  );
}

export default function BusinessSettings() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [appAlerts, setAppAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Privacy
  const [profileVisible, setProfileVisible] = useState(true);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await api.patch('/api/business/profile', { companyName: companyName || undefined });
      Alert.alert('Success', 'Settings updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out', style: 'destructive',
          onPress: async () => { await clearAuth(); router.replace('/'); },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafa' }}>
      {/* Header */}
      <LinearGradient
        colors={['#6d9c9f', '#2d7a7e']}
        style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 8 }}
          >
            <ChevronLeft size={20} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: 'white', letterSpacing: -0.5 }}>Settings</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', marginTop: 1 }}>
              Account & Preferences
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}>

        {/* Account */}
        <SectionLabel label="Account" />
        <SettingCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Building2 size={18} color="#6d9c9f" />
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#1c2b2c' }}>Business Details</Text>
          </View>
          <Text style={{ fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase',
            letterSpacing: 0.8, marginBottom: 6 }}>Company Name</Text>
          <TextInput
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="Your company name..."
            placeholderTextColor="#94a3b8"
            style={{
              height: 50, backgroundColor: '#f8fafa', borderWidth: 1, borderColor: '#e2e8f0',
              borderRadius: 14, paddingHorizontal: 14, fontSize: 15, fontWeight: '700', color: '#0f172a',
            }}
          />
          <View style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 16 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <User size={14} color="#94a3b8" />
            <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600' }}>{user?.email}</Text>
          </View>
          <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600', marginTop: 4 }}>
            Email address cannot be changed
          </Text>
        </SettingCard>

        {/* Notifications */}
        <SectionLabel label="Notifications" />
        <SettingCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Bell size={18} color="#6d9c9f" />
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#1c2b2c' }}>Notification Preferences</Text>
          </View>
          <SettingRow
            label="Email Notifications"
            subtitle="Application updates, contracts, messages"
            value={emailNotifs}
            onChange={setEmailNotifs}
          />
          <SettingRow
            label="Push Notifications"
            subtitle="Real-time alerts on your phone"
            value={pushNotifs}
            onChange={setPushNotifs}
          />
          <SettingRow
            label="In-App Alerts"
            subtitle="Notifications inside the app"
            value={appAlerts}
            onChange={setAppAlerts}
          />
          <SettingRow
            label="Marketing Emails"
            subtitle="Platform tips and newsletters"
            value={marketingEmails}
            onChange={setMarketingEmails}
            last
          />
        </SettingCard>

        {/* Privacy */}
        <SectionLabel label="Privacy & Security" />
        <SettingCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Shield size={18} color="#6d9c9f" />
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#1c2b2c' }}>Privacy Settings</Text>
          </View>
          <SettingRow
            label="Business Profile Visible"
            subtitle="Show your business in freelancer search"
            value={profileVisible}
            onChange={setProfileVisible}
            last
          />
        </SettingCard>

        {/* Billing shortcut */}
        <SectionLabel label="Payments" />
        <TouchableOpacity
          onPress={() => router.push('/(business)/billing' as any)}
          style={{
            backgroundColor: 'white', borderRadius: 22, padding: 18, marginBottom: 4,
            flexDirection: 'row', alignItems: 'center', gap: 14,
            shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
          }}
        >
          <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: '#f0f9fa',
            alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={20} color="#6d9c9f" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#1c2b2c' }}>Billing & Payments</Text>
            <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 1 }}>
              Payment methods, invoices
            </Text>
          </View>
          <ChevronLeft size={18} color="#d8e4e5" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSubmitting}
          style={{
            height: 56, backgroundColor: '#6d9c9f', borderRadius: 18, marginTop: 24,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: isSubmitting ? 0.7 : 1,
            shadowColor: '#6d9c9f', shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
          }}
        >
          {isSubmitting
            ? <ActivityIndicator color="white" />
            : <>
                <Save size={18} color="white" />
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '800' }}>Save Changes</Text>
              </>
          }
        </TouchableOpacity>

        {/* Danger Zone */}
        <Text style={{ fontSize: 11, fontWeight: '900', color: '#ef4444', textTransform: 'uppercase',
          letterSpacing: 1, marginTop: 32, marginBottom: 12, paddingHorizontal: 4 }}>
          Danger Zone
        </Text>
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            backgroundColor: 'white', borderWidth: 1, borderColor: '#fecaca',
            borderRadius: 18, padding: 16, marginBottom: 10,
          }}
        >
          <LogOut size={20} color="#ef4444" />
          <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: '800' }}>Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            backgroundColor: 'white', borderWidth: 1, borderColor: '#fecaca',
            borderRadius: 18, padding: 16,
          }}
        >
          <Trash2 size={20} color="#ef4444" />
          <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: '800' }}>Request Account Deletion</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
