import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  RefreshControl, Animated, Dimensions, Image, Modal, Pressable,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import {
  Eye, Send, Briefcase, TrendingUp, ChevronRight,
  Clock, Zap, ArrowUpRight, Sparkles,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import { computeProfileCompleteness } from '../../lib/profile-utils';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Types ────────────────────────────────────────────────────────────────────
interface FreelancerStats {
  profileViews: number;
  openProposals: number;
  activeContracts: number;
  totalEarnings: number;
  profileCompleteness: number;
}
interface RecentProposal {
  id: string;
  gigTitle: string;
  company: string;
  bidAmount: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
}
interface RecentGig {
  id: string;
  title: string;
  category: string;
  budgetAmount: number;
  business: { name: string; companyName: string | null };
}

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = {
  bg: '#f0f2f8',
  headerTop: '#111d1e',
  headerBot: '#1e3436',
  teal: '#5b9ea1',
  tealLight: '#7bbbbe',
  tealDark: '#2d7a7e',
  tealBg: '#eaf4f5',
  text: '#1c2b2c',
  muted: '#62737a',
  subtle: '#94a3b8',
  white: '#ffffff',
  border: '#e8eef0',
  card: '#ffffff',
};

const STATUS_CFG: Record<string, { bg: string; dot: string; text: string; label: string }> = {
  PENDING: { bg: '#fffbeb', dot: '#f59e0b', text: '#b45309', label: 'Pending' },
  ACCEPTED: { bg: '#f0fdf4', dot: '#22c55e', text: '#15803d', label: 'Hired 🎉' },
  REJECTED: { bg: '#fff1f2', dot: '#f43f5e', text: '#be123c', label: 'Declined' },
  WITHDRAWN: { bg: '#f8fafc', dot: '#94a3b8', text: '#475569', label: 'Withdrawn' },
};

// ─── Completeness Logic moved to src/lib/profile-utils.ts ───────────────────

// ─── Animated fade-slide in ───────────────────────────────────────────────────
function FadeSlide({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 480, delay, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
    }}>
      {children}
    </Animated.View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, actionLabel, onAction }: {
  title: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <Text style={{ fontSize: 17, fontWeight: '800', color: COLORS.text, letterSpacing: -0.4 }}>
        {title}
      </Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Text style={{ color: COLORS.teal, fontWeight: '700', fontSize: 13 }}>{actionLabel}</Text>
          <ArrowUpRight size={13} color={COLORS.teal} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, prefix = '', icon: Icon, gradient, delay }: {
  label: string; value: number; prefix?: string;
  icon: any; gradient: readonly [string, string]; delay: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 550, delay, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{
      flex: 1,
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
    }}>
      <LinearGradient
        colors={gradient as [string, string]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.2 }}
        style={{ borderRadius: 22, padding: 18, minHeight: 110 }}
      >
        {/* Icon bubble */}
        <View style={{
          width: 38, height: 38, borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.22)',
          alignItems: 'center', justifyContent: 'center', marginBottom: 14,
        }}>
          <Icon size={18} color="white" strokeWidth={2.2} />
        </View>

        <Text style={{ color: 'white', fontSize: 26, fontWeight: '900', letterSpacing: -1 }}>
          {prefix}{value.toLocaleString()}
        </Text>
        <Text style={{
          color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '700',
          textTransform: 'uppercase', letterSpacing: 0.9, marginTop: 5,
        }}>
          {label}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Profile Strength Ring ────────────────────────────────────────────────────
function ProfileStrength({ user, onPress }: { user: any; onPress: () => void }) {
  const { score } = computeProfileCompleteness(user);
  const color = score >= 80 ? '#4ade80' : score >= 50 ? '#fbbf24' : '#f87171';
  
  const SIZE = 68;
  const STROKE_WIDTH = 5.2;
  const CENTER = SIZE / 2;
  const RADIUS = (SIZE - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: score,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [score]);

  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      style={{ alignItems: 'center', gap: 4 }}
    >
      <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
          {/* Track */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />
          {/* Progress */}
          <AnimatedCircle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </Svg>
        <View style={{ position: 'absolute' }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: 'white' }}>{score}%</Text>
        </View>
      </View>
      <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>
        Profile
      </Text>
    </TouchableOpacity>
  );
}

// ─── Completeness Modal ───────────────────────────────────────────────────────
function CompletenessModal({ visible, onClose, user, onAction }: { 
  visible: boolean; onClose: () => void; user: any; onAction: (key?: string) => void;
}) {
  const { score, incomplete } = computeProfileCompleteness(user);
  
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable 
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}
        onPress={onClose}
      >
        <Pressable 
          style={{ width: '100%', backgroundColor: 'white', borderRadius: 28, overflow: 'hidden', flexShrink: 1 }}
          onPress={(e) => e.stopPropagation()}
        >
          <LinearGradient colors={['#111d1e', '#1e3436']} style={{ padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: '900' }}>Profile Strength</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 24 }}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{ 
                width: 70, height: 70, borderRadius: 35, borderWidth: 4, 
                borderColor: score >= 80 ? '#4ade80' : '#fbbf24', 
                alignItems: 'center', justifyContent: 'center' 
              }}>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: '900' }}>{score}%</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '700', marginBottom: 4 }}>
                  {score === 100 ? 'All done! 🎉' : 'Almost there!'}
                </Text>
                <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                  <View style={{ width: `${score}%`, height: '100%', backgroundColor: score >= 80 ? '#4ade80' : '#fbbf24', borderRadius: 3 }} />
                </View>
              </View>
            </View>
          </LinearGradient>

          <ScrollView 
            style={{ maxHeight: SCREEN_H * 0.5 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
            showsVerticalScrollIndicator={true}
          >
            {score < 100 ? (
              <>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#62737a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Missing Items
                </Text>
                {incomplete.map((item) => (
                  <TouchableOpacity 
                    key={item.key} 
                    onPress={() => onAction(item.key)}
                    style={{ 
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
                      backgroundColor: '#f8fafc', padding: 14, borderRadius: 16, marginBottom: 8,
                      borderWidth: 1, borderColor: '#edf2f7'
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#f59e0b' }} />
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1c2b2c' }}>{item.label}</Text>
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#6d9c9f' }}>+{item.weight}%</Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Sparkles size={40} color="#fbbf24" />
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1c2b2c', marginTop: 12 }}>Your profile is 100% complete!</Text>
                <Text style={{ fontSize: 14, color: '#62737a', textAlign: 'center', marginTop: 4 }}>You're getting maximum visibility.</Text>
              </View>
            )}
          </ScrollView>

          <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
            <TouchableOpacity 
              onPress={() => score === 100 ? onClose() : onAction()}
              style={{ backgroundColor: '#1e3436', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>
                {score === 100 ? 'Awesome!' : 'Complete Profile'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Proposal Card ────────────────────────────────────────────────────────────
function ProposalCard({ proposal, delay }: { proposal: RecentProposal; delay: number }) {
  const cfg = STATUS_CFG[proposal.status] || STATUS_CFG.PENDING;
  const date = new Date(proposal.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <FadeSlide delay={delay}>
      <TouchableOpacity
        activeOpacity={0.75}
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 20,
          padding: 18,
          marginBottom: 10,
          shadowColor: '#1c2b2c',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.07,
          shadowRadius: 10,
          elevation: 3,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        {/* Top row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontWeight: '800', fontSize: 14.5, color: COLORS.text, marginBottom: 4, lineHeight: 20 }}
              numberOfLines={1}>{proposal.gigTitle}</Text>
            <Text style={{ color: COLORS.muted, fontSize: 12.5, fontWeight: '600' }}>{proposal.company}</Text>
          </View>
          {/* Status badge */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 5,
            backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 30,
          }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: cfg.dot }} />
            <Text style={{ color: cfg.text, fontSize: 11.5, fontWeight: '800' }}>{cfg.label}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: COLORS.border, marginBottom: 12 }} />

        {/* Bottom row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: COLORS.tealDark, fontWeight: '900', fontSize: 17, letterSpacing: -0.5 }}>
            ₹{proposal.bidAmount.toLocaleString()}
          </Text>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 5,
            backgroundColor: '#f8fafc', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20
          }}>
            <Clock size={11} color={COLORS.subtle} />
            <Text style={{ color: COLORS.subtle, fontSize: 12, fontWeight: '700' }}>{date}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </FadeSlide>
  );
}

// ─── Gig Card ─────────────────────────────────────────────────────────────────
function GigCard({ gig, onPress, delay }: { gig: RecentGig; onPress: () => void; delay: number }) {
  return (
    <FadeSlide delay={delay}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 20,
          padding: 16,
          marginBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          shadowColor: '#1c2b2c',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        {/* Icon */}
        <LinearGradient
          colors={[COLORS.tealBg, '#d4eef0']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
        >
          <Briefcase size={22} color={COLORS.teal} strokeWidth={2} />
        </LinearGradient>

        {/* Text */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '800', color: COLORS.text, fontSize: 14, marginBottom: 4 }} numberOfLines={1}>
            {gig.title}
          </Text>
          <Text style={{ color: COLORS.muted, fontSize: 12.5, fontWeight: '600' }}>
            {gig.business.companyName || gig.business.name}
          </Text>
        </View>

        {/* Right side */}
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Text style={{ color: COLORS.tealDark, fontWeight: '900', fontSize: 14, letterSpacing: -0.3 }}>
            ₹{gig.budgetAmount?.toLocaleString()}
          </Text>
          <View style={{
            backgroundColor: COLORS.tealBg, borderRadius: 8,
            paddingHorizontal: 8, paddingVertical: 3,
          }}>
            <Text style={{ color: COLORS.teal, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {gig.category}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </FadeSlide>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyProposals({ onPress }: { onPress: () => void }) {
  return (
    <View style={{
      backgroundColor: COLORS.card,
      borderRadius: 24, padding: 36, alignItems: 'center',
      marginBottom: 28,
      borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed',
    }}>
      <View style={{
        width: 64, height: 64, borderRadius: 20,
        backgroundColor: COLORS.tealBg,
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
      }}>
        <Send size={28} color={COLORS.tealLight} strokeWidth={1.8} />
      </View>
      <Text style={{ color: COLORS.text, fontWeight: '800', fontSize: 15, marginBottom: 6 }}>
        No proposals yet
      </Text>
      <Text style={{ color: COLORS.subtle, fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 22 }}>
        Start applying to gigs and track{'\n'}your proposals here
      </Text>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={[COLORS.teal, COLORS.tealDark]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ borderRadius: 16, paddingVertical: 12, paddingHorizontal: 28 }}
        >
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>Browse Gigs →</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function FreelancerDashboard() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [stats, setStats] = useState<FreelancerStats | null>(null);
  const [proposals, setProposals] = useState<RecentProposal[]>([]);
  const [recommendedGigs, setRecommendedGigs] = useState<RecentGig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const hour = new Date().getHours();
  let greeting = 'Good Evening';
  let greetEmoji = '🌙';

  if (hour >= 5 && hour < 12) {
    greeting = 'Good Morning';
    greetEmoji = '🌤️';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon';
    greetEmoji = '☀️';
  } else if (hour >= 17 && hour < 21) {
    greeting = 'Good Evening';
    greetEmoji = '🌇';
  } else {
    greeting = 'Good Night';
    greetEmoji = '🌙';
  }

  const fetchDashboard = useCallback(async () => {
    try {
      const [statsRes, propsRes, gigsRes, profileRes] = await Promise.allSettled([
        api.get('/api/freelancer/dashboard-stats'),
        api.get('/api/freelancer/recent-proposals'),
        api.get('/api/gigs', { params: { limit: 4, sort: 'latest' } }),
        api.get('/api/freelancer/profile'),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.data ?? null);
      if (propsRes.status === 'fulfilled') setProposals(propsRes.value.data?.data ?? []);
      if (gigsRes.status === 'fulfilled') setRecommendedGigs(gigsRes.value.data?.data ?? []);
      if (profileRes.status === 'fulfilled') {
        updateUser(profileRes.value.data?.data || profileRes.value.data);
      }
    } catch (e) {
      console.error('Dashboard error:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [updateUser]);

  useEffect(() => { fetchDashboard(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchDashboard(); };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.teal} />}
      >
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={[COLORS.headerTop, COLORS.headerBot]}
          start={{ x: 0, y: 0 }} end={{ x: 0.8, y: 1 }}
          style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 36 }}
        >
          {/* Greeting row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, marginRight: 10 }}>
              <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' }}>
                {user?.image ? (
                  <Image source={{ uri: user.image }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>
                      {user?.name?.charAt(0) || 'U'}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700', marginBottom: 2, letterSpacing: 0.2 }}>
                  {greeting} {greetEmoji}
                </Text>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: '900', letterSpacing: -0.5, lineHeight: 28 }} numberOfLines={1}>
                  {user?.name || 'Expert'}
                </Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4,
                  backgroundColor: 'rgba(255,255,255,0.08)', alignSelf: 'flex-start',
                  borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4,
                }}>
                  <Sparkles size={10} color={COLORS.tealLight} />
                  <Text style={{ color: COLORS.tealLight, fontSize: 10, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' }}>
                    Freelancer
                  </Text>
                </View>
              </View>
            </View>

            {computeProfileCompleteness(user).score < 100 && (
              <ProfileStrength user={user} onPress={() => setIsModalVisible(true)} />
            )}
          </View>

          {/* Quick Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(freelancer)/browse-gigs')}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={[COLORS.teal, COLORS.tealDark]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 18, paddingVertical: 15,
                  alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
                }}
              >
                <Zap size={16} color="white" strokeWidth={2.5} />
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 14, letterSpacing: 0.2 }}>Find Work</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(freelancer)/contracts')}
              style={{
                flex: 1, borderRadius: 18, paddingVertical: 15,
                alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
              }}
            >
              <Briefcase size={16} color="white" strokeWidth={2} />
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>Contracts</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── CONTENT ────────────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
          {isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <ActivityIndicator size="large" color={COLORS.teal} />
              <Text style={{ color: COLORS.muted, marginTop: 14, fontWeight: '700', fontSize: 14 }}>
                Loading your workspace...
              </Text>
            </View>
          ) : (
            <>
              {/* ── KPI STATS ── */}
              <FadeSlide delay={0}>
                <SectionHeader title="Your Stats" />
              </FadeSlide>

              <FadeSlide delay={60}>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                  <KpiCard label="Profile Views" value={stats?.profileViews ?? 0}
                    icon={Eye} gradient={[COLORS.teal, COLORS.tealDark]} delay={60} />
                  <KpiCard label="Open Proposals" value={stats?.openProposals ?? 0}
                    icon={Send} gradient={['#f59e0b', '#d97706']} delay={120} />
                </View>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 32 }}>
                  <KpiCard label="Contracts" value={stats?.activeContracts ?? 0}
                    icon={Briefcase} gradient={['#6366f1', '#4f46e5']} delay={180} />
                  <KpiCard label="Total Earned" value={stats?.totalEarnings ?? 0} prefix="₹"
                    icon={TrendingUp} gradient={['#10b981', '#059669']} delay={240} />
                </View>
              </FadeSlide>

              {/* ── PROPOSAL TRACKER ── */}
              <FadeSlide delay={280}>
                <SectionHeader
                  title="Proposal Tracker"
                  actionLabel="Browse More"
                  onAction={() => router.push('/(freelancer)/browse-gigs')}
                />
              </FadeSlide>

              {proposals.length === 0 ? (
                <FadeSlide delay={320}>
                  <EmptyProposals onPress={() => router.push('/(freelancer)/browse-gigs')} />
                </FadeSlide>
              ) : (
                <View style={{ marginBottom: 32 }}>
                  {proposals.map((p, i) => (
                    <ProposalCard key={p.id} proposal={p} delay={300 + i * 60} />
                  ))}
                </View>
              )}

              {/* ── RECOMMENDED GIGS ── */}
              {recommendedGigs.length > 0 && (
                <>
                  <FadeSlide delay={400}>
                    <SectionHeader
                      title="Recommended For You"
                      actionLabel="View All"
                      onAction={() => router.push('/(freelancer)/browse-gigs')}
                    />
                  </FadeSlide>
                  {recommendedGigs.map((gig, i) => (
                    <GigCard
                      key={gig.id}
                      gig={gig}
                      delay={440 + i * 60}
                      onPress={() => router.push(`/public/gig/${gig.id}` as any)}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <CompletenessModal 
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        user={user}
        onAction={(key) => {
          setIsModalVisible(false);
          router.push({
            pathname: '/(freelancer)/profile',
            params: { openModal: key }
          } as any);
        }}
      />
    </View>
  );
}