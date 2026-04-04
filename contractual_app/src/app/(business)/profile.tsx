import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  Alert, RefreshControl, ActivityIndicator, Dimensions, Share
} from 'react-native';
import {
  User, Mail, LogOut, Shield, ChevronRight,
  HelpCircle, Bell, CreditCard, Briefcase, Camera,
  CheckCircle2, Star, Award, ExternalLink,
  MapPin, Calendar, Clock, Share2, Globe, Building2, Users, FileText
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import * as ImagePicker from 'expo-image-picker';
import { EditBusinessProfileModal } from '../../components/profile-modals';

const { width } = Dimensions.get('window');

function StatCard({ label, value, subtitle, icon, color = '#6d9c9f' }: any) {
  return (
    <View style={{
      backgroundColor: 'white', borderRadius: 20, padding: 16, width: width * 0.4,
      marginRight: 12, borderWidth: 1, borderColor: '#f1f5f9',
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
    }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: color + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        {icon}
      </View>
      <Text style={{ fontSize: 20, fontWeight: '900', color: '#1e293b' }}>{value}</Text>
      <Text style={{ fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginTop: 2 }}>{label}</Text>
      <Text style={{ fontSize: 10, fontWeight: '700', color: color, marginTop: 4 }}>{subtitle}</Text>
    </View>
  );
}

function ProfileMenuItem({
  icon: Icon, title, subtitle, onPress, color = '#6d9c9f',
  rightContent, danger = false
}: {
  icon: any; title: string; subtitle?: string; onPress?: () => void;
  color?: string; rightContent?: React.ReactNode; danger?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'white', borderRadius: 16, padding: 14,
        marginBottom: 10, gap: 14,
        borderWidth: 1, borderColor: danger ? '#fee2e2' : '#f1f5f9',
      }}
    >
      <View style={{
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: danger ? '#fef2f2' : color + '10',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} color={danger ? '#dc2626' : color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: danger ? '#dc2626' : '#1c2b2c' }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600', marginTop: 1 }}>{subtitle}</Text>
        )}
      </View>
      {rightContent || <ChevronRight size={14} color="#CBD5E1" />}
    </TouchableOpacity>
  );
}

export default function BusinessProfileScreen() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isUploading, setIsUploading] = useState<{ avatar: boolean, cover: boolean }>({ avatar: false, cover: false });

  const fetchProfileData = useCallback(async () => {
    try {
      const [profileRes, dashRes] = await Promise.all([
        api.get('/api/business/profile'),
        api.get('/api/business/dashboard')
      ]);
      setProfile(profileRes.data?.data || profileRes.data || null);
      setDashboardStats(dashRes.data?.stats || null);
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchProfileData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchProfileData(); };

  const handleImagePick = async (type: 'image' | 'coverImage') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'image' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await uploadImage(asset.uri, type);
      }
    } catch (err) {
      console.error('Image picking error:', err);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const uploadImage = async (uri: string, type: 'image' | 'coverImage') => {
    setIsUploading(prev => ({ ...prev, [type === 'image' ? 'avatar' : 'cover']: true }));
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('file', { uri, name: filename, type: mimeType } as any);

      const uploadRes = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (uploadRes.data?.url) {
        await api.patch('/api/business/profile', { [type]: uploadRes.data.url });
        await fetchProfileData();
      } else {
        throw new Error('No URL returned');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      Alert.alert('Upload Failed', 'There was an error uploading your image.');
    } finally {
      setIsUploading(prev => ({ ...prev, [type === 'image' ? 'avatar' : 'cover']: false }));
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await clearAuth(); router.replace('/'); } },
    ]);
  };

  const getCompleteness = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.image) score += 20;
    if (profile.companyName) score += 20;
    if (profile.companyDesc && profile.companyDesc.length > 30) score += 20;
    if (profile.industry) score += 10;
    if (profile.location) score += 10;
    if (profile.website) score += 10;
    if (profile.coverImage) score += 10;
    return Math.min(100, score);
  };

  if (isLoading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafa', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#6d9c9f" />
        <Text style={{ marginTop: 12, color: '#94a3b8', fontWeight: '700' }}>Loading Profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafa', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#1c2b2c' }}>Something went wrong</Text>
        <TouchableOpacity onPress={onRefresh} className="mt-4 bg-primary px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const completeness = getCompleteness();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafa' }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6d9c9f" />}
      >
        {/* HERO SECTION */}
        <View style={{ backgroundColor: 'white', paddingBottom: 20 }}>
          <View style={{ height: 180, width: '100%', backgroundColor: '#1c2b2c' }}>
            {profile.coverImage ? (
              <Image source={{ uri: profile.coverImage }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <LinearGradient colors={['#6d9c9f', '#2d7a7e']} style={{ flex: 1 }} />
            )}
            <TouchableOpacity
              style={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 8 }}
              onPress={() => handleImagePick('coverImage')}
              disabled={isUploading.cover}
            >
              {isUploading.cover ? <ActivityIndicator size="small" color="white" /> : <Camera size={16} color="white" />}
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 24, marginTop: -50 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <View style={{ position: 'relative' }}>
                <View style={{ width: 100, height: 100, borderRadius: 30, backgroundColor: '#f1f5f9', borderWidth: 4, borderColor: 'white', overflow: 'hidden' }}>
                  {profile.image ? (
                    <Image source={{ uri: profile.image }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0' }}>
                      <User size={40} color="#94a3b8" />
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#6d9c9f', borderRadius: 10, padding: 6, borderWidth: 2, borderColor: 'white' }}
                  onPress={() => handleImagePick('image')}
                  disabled={isUploading.avatar}
                >
                  {isUploading.avatar ? <ActivityIndicator size="small" color="white" /> : <Camera size={14} color="white" />}
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 60 }}>
                <TouchableOpacity
                  onPress={() => Share.share({
                    message: `Check out ${profile.companyName || profile.name} on Contractual!`,
                    url: `https://contractual.pro/business/${profile.id}`,
                    title: 'Share Profile'
                  })}
                  style={{
                    width: 44, height: 44,
                    borderRadius: 14,
                    backgroundColor: '#f1f5f9',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#e2e8f0'
                  }}
                >
                  <Share2 size={20} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsEditModalVisible(true)}
                  style={{
                    height: 44,
                    paddingHorizontal: 20,
                    borderRadius: 14,
                    backgroundColor: '#6d9c9f',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#6d9c9f',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 3
                  }}
                >
                  <Text style={{ fontWeight: '800', color: 'white', fontSize: 14 }}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginTop: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 24, fontWeight: '900', color: '#0f172a' }}>{profile.companyName || profile.name}</Text>
                {profile.approvalStatus === 'APPROVED' && <CheckCircle2 size={18} color="#10b981" fill="#10b98120" />}
              </View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#6d9c9f', marginTop: 4 }}>
                {profile.industry || 'Professional Services'}
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} color="#94a3b8" />
                  <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '700' }}>{profile.location || 'Add Location'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Briefcase size={14} color="#94a3b8" />
                  <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '700' }}>Business Account</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* STATS RIBBON */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}
        >
          <StatCard
            label="Gigs Posted"
            value={dashboardStats?.totalGigsPosted?.toString() || '0'}
            subtitle="Verified listings"
            icon={<Briefcase size={16} color="#6d9c9f" />}
          />
          <StatCard
            label="Active Runs"
            value={dashboardStats?.activeContracts?.toString() || '0'}
            subtitle="Hires in progress"
            icon={<Users size={16} color="#3b82f6" />}
            color="#3b82f6"
          />
          <StatCard
            label="Rating"
            value="5.0"
            subtitle="(0 reviews)"
            icon={<Star size={16} color="#f59e0b" fill="#f59e0b" />}
            color="#f59e0b"
          />
          <StatCard
            label="Total Spent"
            value={`₹${(dashboardStats?.totalSpent || 0).toLocaleString()}`}
            subtitle="Total payouts"
            icon={<CreditCard size={16} color="#10b981" />}
            color="#10b981"
          />
        </ScrollView>

        <View style={{ paddingHorizontal: 24, paddingBottom: 100 }}>
          {/* PROFILE STRENGTH */}
          <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#f1f5f9' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#1c2b2c', textTransform: 'uppercase' }}>Company Trust Score</Text>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#6d9c9f' }}>{completeness}%</Text>
            </View>
            <View style={{ height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ height: 8, width: `${completeness}%`, backgroundColor: '#6d9c9f', borderRadius: 4 }} />
            </View>
            <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '700', marginTop: 10 }}>
              {completeness < 100 ? 'Complete your business profile to attract top talent!' : 'Your company profile looks outstanding!'}
            </Text>
          </View>

          {/* ABOUT SECTION */}
          <View style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#1e293b' }}>About Us</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(true)}>
                <Text style={{ color: '#6d9c9f', fontWeight: '800' }}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 15, color: '#4b5563', lineHeight: 24, fontWeight: '500' }}>
              {profile.companyDesc || "Provide a brief overview of your company, your vision, and the type of talent you're looking for."}
            </Text>
          </View>

          {/* COMPANY LINK */}
          {profile.website && (
            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#1e293b', marginBottom: 12 }}>Online Presence</Text>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'white', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' }}
                onPress={() => Share.share({ url: profile.website })}
              >
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#6d9c9f15', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={20} color="#6d9c9f" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '800', color: '#1e293b' }}>Official Website</Text>
                  <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '600' }}>{profile.website}</Text>
                </View>
                <ExternalLink size={16} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
          )}

          {/* MANAGEMENT SECTION */}
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, marginLeft: 4 }}>
              Management & Settings
            </Text>
            
            <ProfileMenuItem 
              icon={Briefcase} title="Business Settings" subtitle="Company details & branding" 
              onPress={() => setIsEditModalVisible(true)}
            />
            <ProfileMenuItem 
              icon={Briefcase} title="My Gig Posts" subtitle="Manage your open and closed gigs" 
              onPress={() => router.push('/(business)/my-gigs' as any)}
            />
             <ProfileMenuItem 
              icon={FileText} title="Contracts & Invoices" subtitle="Active hires and payment history" 
              onPress={() => router.push('/(business)/contracts' as any)}
            />
            <ProfileMenuItem 
              icon={CreditCard} title="Billing & Payments" subtitle="Wallet balance and cards" 
              onPress={() => router.push('/(business)/billing' as any)}
            />
            <ProfileMenuItem 
              icon={LogOut} title="Sign Out" subtitle="Sign out of your account safely" 
              onPress={handleLogout} danger
            />
          </View>
        </View>
      </ScrollView>

      {/* MODAL */}
      <EditBusinessProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSuccess={fetchProfileData}
        initialData={profile}
      />
    </SafeAreaView>
  );
}
