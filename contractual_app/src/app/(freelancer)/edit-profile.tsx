import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Save, User, MapPin, Briefcase, Info, CreditCard } from 'lucide-react-native';
import api from '../../lib/api';

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    location: '',
    bio: '',
    hourlyRate: '',
    isAvailable: true,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/freelancer/profile');
        const data = res.data?.data || res.data;
        if (data) {
          setFormData({
            name: data.name || '',
            headline: data.headline || '',
            location: data.location || '',
            bio: data.bio || '',
            hourlyRate: data.hourlyRate?.toString() || '0',
            isAvailable: data.isAvailable ?? true,
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile for edit:', err);
        Alert.alert('Error', 'Could not load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setSaving(true);
    try {
      await api.patch('/api/freelancer/profile', {
        ...formData,
        hourlyRate: parseFloat(formData.hourlyRate) || 0,
      });
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err) {
      console.error('Update profile error:', err);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafa', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#6d9c9f" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafa' }} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ 
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'white',
          borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
        }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <ChevronLeft size={24} color="#1c2b2c" />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: '900', color: '#1c2b2c' }}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving} style={{ padding: 8 }}>
            {saving ? <ActivityIndicator size="small" color="#6d9c9f" /> : <Save size={24} color="#6d9c9f" />}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
          {/* PERSONAL INFO */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Personal Details</Text>
            
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <User size={14} color="#6d9c9f" />
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#4b5563' }}>Full Name</Text>
              </View>
              <TextInput
                style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: '600', color: '#1e293b', borderWidth: 1, borderColor: '#f1f5f9' }}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Ex: John Doe"
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Briefcase size={14} color="#6d9c9f" />
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#4b5563' }}>Professional Headline</Text>
              </View>
              <TextInput
                style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: '600', color: '#1e293b', borderWidth: 1, borderColor: '#f1f5f9' }}
                value={formData.headline}
                onChangeText={(text) => setFormData({ ...formData, headline: text })}
                placeholder="Ex: Full Stack Developer | React Expert"
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <MapPin size={14} color="#6d9c9f" />
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#4b5563' }}>Location</Text>
              </View>
              <TextInput
                style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: '600', color: '#1e293b', borderWidth: 1, borderColor: '#f1f5f9' }}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="Ex: Mumbai, India"
              />
            </View>
          </View>

          {/* PROFESSIONAL INFO */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Professional Details</Text>

            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <CreditCard size={14} color="#6d9c9f" />
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#4b5563' }}>Hourly Rate (₹)</Text>
              </View>
              <TextInput
                style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: '600', color: '#1e293b', borderWidth: 1, borderColor: '#f1f5f9' }}
                value={formData.hourlyRate}
                onChangeText={(text) => setFormData({ ...formData, hourlyRate: text.replace(/[^0-9]/g, '') })}
                keyboardType="numeric"
                placeholder="Ex: 500"
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Info size={14} color="#6d9c9f" />
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#4b5563' }}>About Me (Bio)</Text>
              </View>
              <TextInput
                style={{ 
                  backgroundColor: 'white', borderRadius: 16, padding: 16, fontSize: 15, 
                  fontWeight: '600', color: '#1e293b', borderWidth: 1, borderColor: '#f1f5f9',
                  minHeight: 120, textAlignVertical: 'top'
                }}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                multiline
                numberOfLines={6}
                placeholder="Tell clients about your expertise..."
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
                style={{ 
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9'
                }}
              >
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#1e293b' }}>Available for Work</Text>
                  <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 2 }}>Show "Available" badge on profile</Text>
                </View>
                <View style={{ 
                  width: 48, height: 26, borderRadius: 13, 
                  backgroundColor: formData.isAvailable ? '#6d9c9f' : '#e2e8f0',
                  padding: 2, justifyContent: 'center', alignItems: formData.isAvailable ? 'flex-end' : 'flex-start'
                }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: 'white' }} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSave}
            disabled={saving}
            style={{ 
              backgroundColor: '#6d9c9f', borderRadius: 18, padding: 18, 
              alignItems: 'center', justifyContent: 'center', marginTop: 10,
              shadowColor: '#6d9c9f', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3, shadowRadius: 10, elevation: 6
            }}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '900' }}>Save Changes</Text>
            )}
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
