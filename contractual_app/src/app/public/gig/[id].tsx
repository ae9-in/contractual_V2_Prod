import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  Image, Share, Alert, TextInput, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft, Share2, Calendar, IndianRupee, Briefcase,
  Shield, CheckCircle2, Building2, Users, Clock, Zap,
  Star, ChevronRight, Send, X, Award
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../../lib/api';
import { useAuthStore } from '../../../stores/authStore';

interface GigDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetAmount: number;
  minBudget: number | null;
  maxBudget: number | null;
  budgetType: string;
  bannerImage?: string | null;
  status: string;
  isUrgent: boolean;
  experienceLevel: string;
  duration?: string | null;
  deadline?: string | null;
  createdAt: string;
  requiredSkills?: { name: string }[];
  _count?: { applications: number };
  userApplication?: { status: string; bidAmount?: number } | null;
  business: {
    id: string;
    name: string;
    companyName: string | null;
    image: string | null;
    isVerified?: boolean;
    description?: string | null;
  };
}

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: 'Entry Level',
  INTERMEDIATE: 'Mid Level',
  EXPERT: 'Expert Level',
};

const APP_STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  PENDING:   { bg: '#fef3c7', text: '#d97706', label: '⏳ Application Pending' },
  ACCEPTED:  { bg: '#ecfdf5', text: '#059669', label: '🎉 You\'re Hired!' },
  REJECTED:  { bg: '#fef2f2', text: '#dc2626', label: '❌ Not Selected' },
  WITHDRAWN: { bg: '#f8fafc', text: '#64748b', label: '↩ Withdrawn' },
};

function ApplyModal({
  visible, gigTitle, onClose, onSubmit, isSubmitting
}: {
  visible: boolean; gigTitle: string;
  onClose: () => void; onSubmit: (bid: number, note: string) => void;
  isSubmitting: boolean;
}) {
  const [bid, setBid] = useState('');
  const [note, setNote] = useState('');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 32, padding: 28, paddingBottom: 40 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#1c2b2c' }}>Submit Proposal</Text>
              <TouchableOpacity onPress={onClose}
                style={{ backgroundColor: '#f1f5f9', borderRadius: 10, padding: 8 }}>
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: '#62737a', fontSize: 13, fontWeight: '600', marginBottom: 20 }}
              numberOfLines={2}>{gigTitle}</Text>

            <Text style={{ fontSize: 12, fontWeight: '800', color: '#1c2b2c',
              textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              Your Bid (₹) *
            </Text>
            <TextInput
              value={bid}
              onChangeText={setBid}
              placeholder="e.g. 5000"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
              style={{ backgroundColor: '#f8fafa', borderWidth: 1.5, borderColor: '#e2e8f0',
                borderRadius: 16, paddingHorizontal: 18, height: 52, fontSize: 17,
                fontWeight: '700', color: '#1c2b2c', marginBottom: 16 }}
            />

            <Text style={{ fontSize: 12, fontWeight: '800', color: '#1c2b2c',
              textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              Cover Letter / Note *
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Why are you the best fit for this gig? Mention relevant experience..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholderTextColor="#94a3b8"
              style={{ backgroundColor: '#f8fafa', borderWidth: 1.5, borderColor: '#e2e8f0',
                borderRadius: 16, padding: 18, minHeight: 120, fontSize: 14,
                fontWeight: '500', color: '#1c2b2c', marginBottom: 24 }}
            />

            <TouchableOpacity
              onPress={() => onSubmit(Number(bid), note)}
              disabled={isSubmitting || !bid || !note.trim()}
              style={{
                backgroundColor: (!bid || !note.trim()) ? '#d8e4e5' : '#6d9c9f',
                borderRadius: 18, paddingVertical: 16, alignItems: 'center',
                flexDirection: 'row', justifyContent: 'center', gap: 8,
              }}
            >
              {isSubmitting
                ? <ActivityIndicator color="white" />
                : <>
                    <Send size={18} color="white" />
                    <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>Submit Proposal</Text>
                  </>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function GigDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const [gig, setGig] = useState<GigDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGigDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/gigs/${id}`);
      setGig(response.data?.data || response.data);
      setError(null);
    } catch (err: any) {
      setError('Failed to load gig details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { if (id) fetchGigDetails(); }, [id]);

  const handleApply = () => {
    if (!user) { router.push('/auth/signin'); return; }
    if (user.role !== 'freelancer') {
      Alert.alert('Business Account', 'Only freelancers can apply to gigs.');
      return;
    }
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async (bidAmount: number, note: string) => {
    if (!bidAmount || bidAmount < 1) {
      Alert.alert('Invalid Bid', 'Please enter a valid bid amount.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/api/applications`, {
        gigId: id,
        bidAmount,
        note,
      });
      setShowApplyModal(false);
      Alert.alert('🎉 Applied!', 'Your proposal has been submitted successfully. We\'ll notify you when the business responds.', [
        { text: 'View My Proposals', onPress: () => router.push('/(freelancer)/dashboard') },
        { text: 'OK' },
      ]);
      // Refresh gig to show updated application status
      fetchGigDetails();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to submit application.';
      Alert.alert('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this gig: "${gig?.title}" on Contractual!`,
        url: `https://contractual.in/gigs/${id}`,
      });
    } catch (e) {}
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6d9c9f" />
        <Text style={{ color: '#62737a', marginTop: 12, fontWeight: '600' }}>Loading gig...</Text>
      </View>
    );
  }

  if (error || !gig) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ padding: 24 }}>
          <TouchableOpacity onPress={() => router.back()}
            style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 10, alignSelf: 'flex-start' }}>
            <ArrowLeft size={22} color="#62737a" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <Text style={{ color: '#dc2626', fontWeight: '700', textAlign: 'center', marginBottom: 16, fontSize: 16 }}>
            {error || 'Gig not found'}
          </Text>
          <TouchableOpacity onPress={fetchGigDetails}
            style={{ backgroundColor: '#6d9c9f', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 24 }}>
            <Text style={{ color: 'white', fontWeight: '800' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const budget = gig.budgetAmount
    ? `₹${gig.budgetAmount.toLocaleString()}`
    : (gig.minBudget && gig.maxBudget)
    ? `₹${gig.minBudget.toLocaleString()} – ₹${gig.maxBudget.toLocaleString()}`
    : 'Negotiable';

  const companyInitial = (gig.business.companyName || gig.business.name || 'B')[0].toUpperCase();
  const hasApplied = !!gig.userApplication;
  const appCfg = gig.userApplication ? APP_STATUS_CONFIG[gig.userApplication.status] : null;
  const isFreelancer = user?.role === 'freelancer';
  const canApply = isFreelancer && !hasApplied && gig.status === 'OPEN';

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafa' }}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={{ height: 220, position: 'relative' }}>
          <LinearGradient
            colors={['#6d9c9f', '#2d7a7e']}
            style={{ position: 'absolute', inset: 0 }}
          />
          {gig.bannerImage && (
            <Image source={{ uri: gig.bannerImage }}
              style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.3 }}
            />
          )}
          {/* Overlay pattern text */}
          {!gig.bannerImage && (
            <Text style={{ position: 'absolute', bottom: 20, right: 20, fontSize: 80, fontWeight: '900',
              color: 'rgba(255,255,255,0.08)', lineHeight: 80, textAlign: 'right' }}
              numberOfLines={1}>{gig.category}</Text>
          )}

          {/* Nav bar */}
          <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between',
              paddingHorizontal: 20, paddingTop: 12 }}>
              <TouchableOpacity onPress={() => router.back()}
                style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: 10 }}>
                <ArrowLeft size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare}
                style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: 10 }}>
                <Share2 size={20} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Urgency badge */}
          {gig.isUrgent && (
            <View style={{ position: 'absolute', bottom: 20, left: 20,
              backgroundColor: '#dc2626', flexDirection: 'row', alignItems: 'center',
              gap: 5, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Zap size={13} color="white" />
              <Text style={{ color: 'white', fontSize: 11, fontWeight: '900' }}>URGENT HIRE</Text>
            </View>
          )}
        </View>

        {/* Card Body */}
        <View style={{ backgroundColor: '#f8fafa', borderTopLeftRadius: 32, borderTopRightRadius: 32,
          marginTop: -20, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 120 }}>

          {/* Category + Status row */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <View style={{ backgroundColor: '#f0f9fa', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <Text style={{ color: '#6d9c9f', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>
                {gig.category}
              </Text>
            </View>
            {gig.status !== 'OPEN' && (
              <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '800' }}>⚫ {gig.status}</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={{ fontSize: 24, fontWeight: '900', color: '#1c2b2c',
            lineHeight: 30, marginBottom: 20, letterSpacing: -0.5 }}>
            {gig.title}
          </Text>

          {/* Business Card */}
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 16,
            flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#e2e8f0',
              overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
              {gig.business.image
                ? <Image source={{ uri: gig.business.image }} style={{ width: 48, height: 48 }} />
                : <Text style={{ fontSize: 18, fontWeight: '900', color: '#6d9c9f' }}>{companyInitial}</Text>
              }
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', color: '#1c2b2c', fontSize: 15 }}>
                {gig.business.companyName || gig.business.name}
              </Text>
              {gig.business.isVerified && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                  <Shield size={12} color="#6d9c9f" />
                  <Text style={{ color: '#6d9c9f', fontSize: 12, fontWeight: '700' }}>Verified Business</Text>
                </View>
              )}
            </View>
            <View style={{ backgroundColor: '#f0f9fa', borderRadius: 12, padding: 8 }}>
              <ChevronRight size={16} color="#6d9c9f" />
            </View>
          </View>

          {/* Info Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
            {[
              { icon: IndianRupee, label: 'Budget', value: budget },
              { icon: Briefcase, label: 'Type', value: gig.budgetType === 'HOURLY' ? 'Hourly' : 'Fixed' },
              { icon: Award, label: 'Level', value: LEVEL_LABEL[gig.experienceLevel] || gig.experienceLevel },
              { icon: Users, label: 'Applied', value: `${gig._count?.applications ?? 0}` },
              ...(gig.duration ? [{ icon: Clock, label: 'Duration', value: gig.duration }] : []),
              ...(gig.deadline ? [{
                icon: Calendar, label: 'Deadline',
                value: new Date(gig.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              }] : []),
            ].map((item, i) => (
              <View key={i} style={{ backgroundColor: 'white', borderRadius: 16, padding: 14,
                width: '47.5%', shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04, shadowRadius: 5, elevation: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <item.icon size={14} color="#6d9c9f" />
                  <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '800',
                    textTransform: 'uppercase', letterSpacing: 0.8 }}>{item.label}</Text>
                </View>
                <Text style={{ fontWeight: '800', color: '#1c2b2c', fontSize: 14 }}>{item.value}</Text>
              </View>
            ))}
          </View>

          {/* Required Skills */}
          {gig.requiredSkills && gig.requiredSkills.length > 0 && (
            <>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#1c2b2c', marginBottom: 12, letterSpacing: -0.3 }}>
                Required Skills
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {gig.requiredSkills.map((s) => (
                  <View key={s.name} style={{ backgroundColor: '#f0f9fa', borderWidth: 1, borderColor: '#d8e4e5',
                    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 }}>
                    <Text style={{ color: '#2d7a7e', fontWeight: '700', fontSize: 13 }}>{s.name}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Description */}
          <Text style={{ fontSize: 16, fontWeight: '900', color: '#1c2b2c', marginBottom: 12, letterSpacing: -0.3 }}>
            Project Overview
          </Text>
          <Text style={{ color: '#374151', lineHeight: 26, fontSize: 15, fontWeight: '500', marginBottom: 24 }}>
            {gig.description}
          </Text>

          {/* Business About */}
          {gig.business.description && (
            <>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#1c2b2c', marginBottom: 12, letterSpacing: -0.3 }}>
                About the Company
              </Text>
              <View style={{ backgroundColor: 'white', borderRadius: 18, padding: 18, marginBottom: 24,
                shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04, shadowRadius: 5, elevation: 2 }}>
                <Text style={{ color: '#374151', lineHeight: 23, fontSize: 14, fontWeight: '500' }}>
                  {gig.business.description}
                </Text>
              </View>
            </>
          )}

          {/* Application status if already applied */}
          {hasApplied && appCfg && (
            <View style={{ backgroundColor: appCfg.bg, borderRadius: 20, padding: 20, alignItems: 'center' }}>
              <Text style={{ color: appCfg.text, fontSize: 16, fontWeight: '900' }}>{appCfg.label}</Text>
              {gig.userApplication?.bidAmount && (
                <Text style={{ color: appCfg.text, fontSize: 13, fontWeight: '600', marginTop: 6, opacity: 0.8 }}>
                  Your bid: ₹{gig.userApplication.bidAmount.toLocaleString()}
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating CTA */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'white', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08, shadowRadius: 20, elevation: 12 }}>
        {canApply ? (
          <TouchableOpacity
            onPress={handleApply}
            style={{ backgroundColor: '#6d9c9f', borderRadius: 20, paddingVertical: 18,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
              shadowColor: '#6d9c9f', shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3, shadowRadius: 14, elevation: 8 }}
          >
            <Send size={20} color="white" />
            <Text style={{ color: 'white', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 }}>
              Apply Now
            </Text>
          </TouchableOpacity>
        ) : hasApplied ? (
          <View style={{ backgroundColor: '#f1f5f9', borderRadius: 20, paddingVertical: 18, alignItems: 'center' }}>
            <Text style={{ color: '#64748b', fontSize: 15, fontWeight: '800' }}>
              {appCfg?.label || 'Application Submitted'}
            </Text>
          </View>
        ) : gig.status !== 'OPEN' ? (
          <View style={{ backgroundColor: '#f1f5f9', borderRadius: 20, paddingVertical: 18, alignItems: 'center' }}>
            <Text style={{ color: '#64748b', fontSize: 15, fontWeight: '800' }}>
              This gig is no longer accepting applications
            </Text>
          </View>
        ) : !user ? (
          <TouchableOpacity onPress={() => router.push('/auth/signin')}
            style={{ backgroundColor: '#6d9c9f', borderRadius: 20, paddingVertical: 18, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 17, fontWeight: '900' }}>Sign in to Apply</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Apply Modal */}
      <ApplyModal
        visible={showApplyModal}
        gigTitle={gig.title}
        onClose={() => setShowApplyModal(false)}
        onSubmit={handleSubmitApplication}
        isSubmitting={isSubmitting}
      />
    </View>
  );
}
