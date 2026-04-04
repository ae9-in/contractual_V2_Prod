import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  Alert, RefreshControl, ActivityIndicator, Dimensions, Share
} from 'react-native';
import {
  User, Mail, LogOut, Shield, ChevronRight,
  HelpCircle, Bell, CreditCard, Briefcase, Camera,
  CheckCircle2, TrendingUp, Star, Award, ExternalLink,
  MapPin, Calendar, Clock, Share2, Eye, Plus, Globe, Box
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import { computeProfileCompleteness } from '../../lib/profile-utils';
import { SectionHeader, SkillChip, PortfolioCard, TimelineItem } from '../../components/profile-sections';
import { AddSkillModal, AddPortfolioModal, AddExperienceModal, AddEducationModal, EditSocialLinksModal, EditProfileInfoModal } from '../../components/profile-modals';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

interface FreelancerProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  coverImage: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  hourlyRate: number | null;
  availability: string | null;
  isAvailable: boolean;
  createdAt: string;
  skills: { id: string; name: string; level?: string }[];
  portfolio: { id: string; title: string; imageUrl: string | null; url?: string }[];
  education: { id: string; institution: string; degree: string; startYear: number; endYear: number | null }[];
  experience: { id: string; title: string; company: string; startYear: number; endYear: number | null; current: boolean }[];
  reviewCount?: number;
  completedContracts?: number;
  activeContracts?: number;
  avgRating?: number;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  behanceUrl?: string | null;
}

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

export default function FreelancerProfileScreen() {
  const { clearAuth, updateUser } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeModal, setActiveModal] = useState<'skill' | 'portfolio' | 'experience' | 'education' | 'social' | 'profileInfo' | null>(null);
  const [isUploading, setIsUploading] = useState<{ avatar: boolean, cover: boolean }>({ avatar: false, cover: false });

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
      const match = /\\.(\\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('file', { uri, name: filename, type: mimeType } as any);

      const uploadRes = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (uploadRes.data?.url) {
        await api.patch('/api/freelancer/profile', { [type]: uploadRes.data.url });
        await fetchProfile();
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

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/api/freelancer/profile');
      const data = res.data?.data || res.data || null;
      setProfile(data);
      if (data) updateUser(data);
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchProfile(); };
  
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.openModal) {
      const key = params.openModal as string;
      if (['headline', 'bio', 'hourlyRate', 'image'].includes(key)) {
        setActiveModal('profileInfo');
      } else if (key === 'skills') {
        setActiveModal('skill');
      } else if (key === 'portfolio') {
        setActiveModal('portfolio');
      } else if (key === 'education') {
        setActiveModal('education');
      } else if (key === 'experience') {
        setActiveModal('experience');
      }
    }
  }, [params.openModal]);

  const handleDelete = async (type: string, id: string) => {
    Alert.alert(`Delete ${type}`, `Are you sure you want to remove this ${type.toLowerCase()}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/freelancer/${type.toLowerCase()}/${id}`);
            fetchProfile();
          } catch (err) {
            Alert.alert('Error', `Failed to delete ${type.toLowerCase()}`);
          }
        }
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await clearAuth(); router.replace('/'); } },
    ]);
  };

  const getCompleteness = () => {
    if (!profile) return 0;
    return computeProfileCompleteness(profile).score;
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
              <LinearGradient colors={['#0f172a', '#1e293b']} style={{ flex: 1 }} />
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
                    message: `Check out ${profile.name}'s profile on Contractual!`,
                    url: `https://contractual.pro/freelancer/${profile.id}`,
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
                  onPress={() => setActiveModal('profileInfo')}
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
              <Text style={{ fontSize: 24, fontWeight: '900', color: '#0f172a' }}>{profile.name}</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#6d9c9f', marginTop: 4 }}>
                {profile.headline || 'Add a Professional Headline'}
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} color="#94a3b8" />
                  <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '700' }}>{profile.location || 'Add Location'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} color="#94a3b8" />
                  <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '700' }}>Joined {new Date(profile.createdAt).getFullYear()}</Text>
                </View>
                {profile.isAvailable && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' }} />
                    <Text style={{ fontSize: 13, color: '#10b981', fontWeight: '800' }}>Available for work</Text>
                  </View>
                )}
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
            label="Rating"
            value={profile.avgRating ? profile.avgRating.toFixed(1) : '—'}
            subtitle={`(${profile.reviewCount || 0} reviews)`}
            icon={<Star size={16} color="#f59e0b" fill="#f59e0b" />}
          />
          <StatCard
            label="Jobs Done"
            value={profile.completedContracts?.toString() || '0'}
            subtitle="Verified Projects"
            icon={<CheckCircle2 size={16} color="#10b981" />}
            color="#10b981"
          />
          <StatCard
            label="Hourly Rate"
            value={`₹${profile.hourlyRate || 0}`}
            subtitle="Current rate"
            icon={<CreditCard size={16} color="#6d9c9f" />}
          />
          <StatCard
            label="Active"
            value={profile.activeContracts?.toString() || '0'}
            subtitle="In Progress"
            icon={<Clock size={16} color="#3b82f6" />}
            color="#3b82f6"
          />
        </ScrollView>

        <View style={{ paddingHorizontal: 24, paddingBottom: 100 }}>
          {/* PROFILE STRENGTH */}
          <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#f1f5f9' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#1c2b2c', textTransform: 'uppercase' }}>Profile Strength</Text>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#6d9c9f' }}>{completeness}%</Text>
            </View>
            <View style={{ height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ height: 8, width: `${completeness}%`, backgroundColor: '#6d9c9f', borderRadius: 4 }} />
            </View>
            <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '700', marginTop: 10 }}>
              {completeness < 100 ? 'Add more details to get better visibility!' : 'Your profile is ready to dominate!'}
            </Text>
          </View>

          <View style={{ marginBottom: 32 }}>
            <SectionHeader title="About Me" onAction={() => setActiveModal('profileInfo')} actionLabel="Edit" />
            <Text style={{ fontSize: 15, color: '#4b5563', lineHeight: 24, fontWeight: '500' }}>
              {profile.bio || "Tell clients about yourself, your expertise, and what makes you stand out."}
            </Text>
          </View>

          {/* SKILLS */}
          <View style={{ marginBottom: 32 }}>
            <SectionHeader title="Skills & Expertise" onAction={() => setActiveModal('skill')} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {profile.skills?.map(skill => (
                <SkillChip
                  key={skill.id}
                  name={skill.name}
                  level={skill.level}
                  onRemove={() => handleDelete('Skills', skill.id)}
                />
              ))}
              {(!profile.skills || profile.skills.length === 0) && (
                <Text style={{ color: '#94a3b8', fontWeight: '600' }}>No skills added yet.</Text>
              )}
            </View>
          </View>

          {/* PORTFOLIO */}
          <View style={{ marginBottom: 32 }}>
            <SectionHeader title="Portfolio" onAction={() => setActiveModal('portfolio')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {profile.portfolio?.map(item => (
                <PortfolioCard
                  key={item.id}
                  title={item.title}
                  imageUrl={item.imageUrl}
                  onPress={() => handleDelete('Portfolio', item.id)}
                />
              ))}
              {(!profile.portfolio || profile.portfolio.length === 0) && (
                <View style={{ width: width - 48, height: 100, borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#94a3b8', fontWeight: '700' }}>Share your best work here</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* TIMELINE */}
          <View style={{ marginBottom: 32 }}>
            <SectionHeader title="Experience & Education" onAction={() => {
              Alert.alert('Add History', 'What would you like to add?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Experience', onPress: () => setActiveModal('experience') },
                { text: 'Education', onPress: () => setActiveModal('education') },
              ]);
            }} />
            <View>
              {profile.experience?.map(exp => (
                <TimelineItem
                  key={exp.id}
                  type="experience"
                  title={exp.title}
                  subtitle={exp.company}
                  dateRange={`${exp.startYear} - ${exp.current ? 'Present' : exp.endYear}`}
                  onRemove={() => handleDelete('Experience', exp.id)}
                />
              ))}
              {profile.education?.map(edu => (
                <TimelineItem
                  key={edu.id}
                  type="education"
                  title={edu.degree}
                  subtitle={edu.institution}
                  dateRange={`${edu.startYear} - ${edu.endYear || 'Present'}`}
                  onRemove={() => handleDelete('Education', edu.id)}
                />
              ))}
              {(!profile.experience?.length && !profile.education?.length) && (
                <Text style={{ color: '#94a3b8', fontWeight: '600' }}>Share your professional background.</Text>
              )}
            </View>
          </View>

          <View style={{ marginBottom: 40 }}>
            <SectionHeader title="Social Links" onAction={() => setActiveModal('social')} actionLabel="Edit" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {profile.linkedinUrl && (
                <TouchableOpacity className="w-12 h-12 rounded-2xl bg-white border border-slate-100 items-center justify-center shadow-sm">
                  <ExternalLink size={20} color="#0077b5" />
                </TouchableOpacity>
              )}
              {profile.githubUrl && (
                <TouchableOpacity className="w-12 h-12 rounded-2xl bg-white border border-slate-100 items-center justify-center shadow-sm">
                  <ExternalLink size={20} color="#333" />
                </TouchableOpacity>
              )}
              {profile.websiteUrl && (
                <TouchableOpacity className="w-12 h-12 rounded-2xl bg-white border border-slate-100 items-center justify-center shadow-sm">
                  <Globe size={20} color="#6d9c9f" />
                </TouchableOpacity>
              )}
              {profile.behanceUrl && (
                <TouchableOpacity className="w-12 h-12 rounded-2xl bg-white border border-slate-100 items-center justify-center shadow-sm">
                  <Box size={20} color="#053eff" />
                </TouchableOpacity>
              )}
              {!profile.linkedinUrl && !profile.githubUrl && !profile.websiteUrl && !profile.behanceUrl && (
                <Text style={{ color: '#94a3b8', fontWeight: '600' }}>No social links added yet.</Text>
              )}
            </View>
          </View>

          {/* LOGOUT */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              padding: 18, borderRadius: 20, backgroundColor: '#fff',
              borderWidth: 1, borderColor: '#fee2e2', gap: 10
            }}
          >
            <LogOut size={20} color="#ef4444" />
            <Text style={{ color: '#ef4444', fontWeight: '900', fontSize: 16 }}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODALS */}
      <AddSkillModal
        visible={activeModal === 'skill'}
        onClose={() => setActiveModal(null)}
        onSuccess={fetchProfile}
      />
      <AddPortfolioModal
        visible={activeModal === 'portfolio'}
        onClose={() => setActiveModal(null)}
        onSuccess={fetchProfile}
      />
      <AddExperienceModal
        visible={activeModal === 'experience'}
        onClose={() => setActiveModal(null)}
        onSuccess={fetchProfile}
      />
      <AddEducationModal
        visible={activeModal === 'education'}
        onClose={() => setActiveModal(null)}
        onSuccess={fetchProfile}
      />
      <EditSocialLinksModal
        visible={activeModal === 'social'}
        onClose={() => setActiveModal(null)}
        onSuccess={fetchProfile}
        initialData={profile}
      />
      <EditProfileInfoModal
        visible={activeModal === 'profileInfo'}
        onClose={() => setActiveModal(null)}
        onSuccess={fetchProfile}
        initialData={profile}
      />
    </SafeAreaView>
  );
}
