import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  PlusCircle, Briefcase, Users, IndianRupee,
  Bell, User, FileText, ChevronRight,
  TrendingUp, Clock, CreditCard, MessageSquare, Zap
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalGigsPosted: number;
  totalApplications: number;
  activeContracts: number;
  totalSpent: number;
  applicationsToday: number;
  contractsEndingSoon: number;
}

interface RecentGig {
  id: string;
  title: string;
  status: string;
  budgetAmount: number;
  minBudget?: number;
  maxBudget?: number;
  _count?: { applications: number };
}

interface Applicant {
  id: string;
  name: string;
  headline: string | null;
  rating: string;
  initials: string;
}

interface ActivityItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  OPEN:   { bg: '#ecfdf5', text: '#059669', label: '🟢 Active' },
  PAUSED: { bg: '#fef3c7', text: '#d97706', label: '🟡 Paused' },
  CLOSED: { bg: '#f8fafc', text: '#64748b', label: '⚫ Closed' },
  DRAFT:  { bg: '#eff6ff', text: '#2563eb', label: '📝 Draft' },
};

function KpiCard({
  label, value, prefix = '', icon: Icon, gradient, trend, trendAmber
}: {
  label: string; value: number; prefix?: string;
  icon: any; gradient: readonly [string, string]; trend?: string; trendAmber?: boolean;
}) {
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 20, padding: 18,
        width: (width - 60) / 2, marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '700',
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            {label}
          </Text>
          <Text style={{ color: 'white', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 }}>
            {prefix}{value.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 8 }}>
          <Icon size={20} color="white" />
        </View>
      </View>
      {trend && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {trendAmber
            ? <Clock size={11} color="rgba(255,255,255,0.8)" />
            : <TrendingUp size={11} color="rgba(255,255,255,0.8)" />
          }
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700' }}>
            {trend}
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(ms / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function BusinessDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentGigs, setRecentGigs] = useState<RecentGig[]>([]);
  const [topApplicants, setTopApplicants] = useState<Applicant[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const [gigsRes, contractsRes, appsRes, notifsRes] = await Promise.allSettled([
        api.get('/api/business/my-gigs'),
        api.get('/api/contracts'),
        api.get('/api/business/applications'),
        api.get('/api/notifications'),
      ]);

      const gigs: any[] = gigsRes.status === 'fulfilled' ? (gigsRes.value.data?.data?.gigs || []) : [];
      const contracts: any[] = contractsRes.status === 'fulfilled' ? (contractsRes.value.data?.data || []) : [];
      const apps: any[] = appsRes.status === 'fulfilled' ? (appsRes.value.data?.data || appsRes.value.data || []) : [];
      const notifs: any[] = notifsRes.status === 'fulfilled' ? (notifsRes.value.data?.data || notifsRes.value.data || []) : [];

      const ACTIVE_STATUSES = ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED'];
      const activeContracts = contracts.filter(c => ACTIVE_STATUSES.includes(c.status));
      const completedContracts = contracts.filter(c => c.status === 'COMPLETED');
      const totalSpent = completedContracts.reduce((acc, c) => acc + (c.agreedPrice || 0), 0);
      const contractsEndingSoon = activeContracts.filter(c => {
        if (!c.deadline) return false;
        const daysLeft = (new Date(c.deadline).getTime() - Date.now()) / 86400000;
        return daysLeft >= 0 && daysLeft <= 14;
      }).length;

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const applicationsToday = apps.filter(a => new Date(a.createdAt) >= today).length;

      setStats({
        totalGigsPosted: gigs.length,
        totalApplications: apps.length,
        activeContracts: activeContracts.length,
        totalSpent,
        applicationsToday,
        contractsEndingSoon,
      });

      setRecentGigs(gigs.slice(0, 5));

      // Top applicants: unique freelancers from apps
      const seen = new Set<string>();
      const top: Applicant[] = [];
      for (const a of apps) {
        const f = a.freelancer;
        if (!f || seen.has(f.id)) continue;
        seen.add(f.id);
        const nm = (f.name || '').trim().split(/\s+/);
        const initials = nm.length >= 2 ? (nm[0][0] + nm[1][0]).toUpperCase() : (f.name || 'U').slice(0, 2).toUpperCase();
        top.push({
          id: f.id,
          name: f.name,
          headline: f.headline || 'Freelancer',
          rating: f.reviewAvg != null ? f.reviewAvg.toFixed(1) : '—',
          initials,
        });
        if (top.length >= 4) break;
      }
      setTopApplicants(top);
      setActivity(notifs.slice(0, 6));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchDashboard(); };

  const hour = new Date().getHours();
  let greeting = 'Good Evening';
  if (hour >= 5 && hour < 12) {
    greeting = 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon';
  } else if (hour >= 17 && hour < 21) {
    greeting = 'Good Evening';
  } else {
    greeting = 'Good Night';
  }
  const firstName = (user?.name || 'Business').split(' ')[0];

  const quickActions = [
    { label: 'Post Gig', icon: PlusCircle, route: '/(business)/post-gig' as any, bg: '#6d9c9f' },
    { label: 'Applications', icon: Users, route: '/(business)/applications' as any, bg: '#3b82f6' },
    { label: 'Contracts', icon: FileText, route: '/(business)/contracts' as any, bg: '#8b5cf6' },
    { label: 'Billing', icon: CreditCard, route: '/(business)/billing' as any, bg: '#f59e0b' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafa' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6d9c9f" />}
      >
        {/* ── Header ── */}
        <LinearGradient
          colors={['#6d9c9f', '#2d7a7e']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600', marginBottom: 2 }}>
                {greeting} 👋
              </Text>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 }}>
                {firstName}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => router.push('/(business)/notifications' as any)}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: 10 }}
              >
                <Bell size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/(business)/profile')}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: 10 }}
              >
                <User size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Action buttons in header */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push('/(business)/post-gig')}
              style={{ flex: 1, backgroundColor: 'white', borderRadius: 16, paddingVertical: 14,
                alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            >
              <PlusCircle size={18} color="#6d9c9f" />
              <Text style={{ color: '#2d7a7e', fontWeight: '800', fontSize: 14 }}>Post a Gig</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(business)/applications' as any)}
              style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16,
                paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            >
              <Users size={18} color="white" />
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>Applications</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          {/* ── KPI Cards ── */}
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#1c2b2c', marginBottom: 16, letterSpacing: -0.3 }}>
            Overview
          </Text>

          {isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" color="#6d9c9f" />
              <Text style={{ color: '#62737a', marginTop: 12, fontWeight: '600' }}>Loading dashboard...</Text>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                <KpiCard
                  label="Gigs Posted" value={stats?.totalGigsPosted ?? 0}
                  icon={Briefcase} gradient={['#6d9c9f', '#2d7a7e']}
                  trend={stats?.totalGigsPosted ? `${stats.totalGigsPosted} total` : 'No gigs yet'}
                />
                <KpiCard
                  label="Applications" value={stats?.totalApplications ?? 0}
                  icon={Users} gradient={['#f59e0b', '#d97706']}
                  trend={stats?.applicationsToday ? `+${stats.applicationsToday} today` : 'No new today'}
                />
                <KpiCard
                  label="Active Contracts" value={stats?.activeContracts ?? 0}
                  icon={FileText} gradient={['#6366f1', '#4f46e5']}
                  trend={stats?.contractsEndingSoon ? `${stats.contractsEndingSoon} ending soon` : 'None ending soon'}
                  trendAmber={(stats?.contractsEndingSoon ?? 0) > 0}
                />
                <KpiCard
                  label="Total Spent" value={Math.round(stats?.totalSpent ?? 0)}
                  prefix="₹" icon={IndianRupee} gradient={['#10b981', '#059669']}
                  trend="Completed contracts"
                />
              </View>

              {/* ── Quick Actions ── */}
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#1c2b2c', marginBottom: 16, marginTop: 12, letterSpacing: -0.3 }}>
                Quick Actions
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 28 }}>
                {quickActions.map(qa => (
                  <TouchableOpacity
                    key={qa.label}
                    onPress={() => router.push(qa.route)}
                    style={{
                      flex: 1, backgroundColor: 'white', borderRadius: 16,
                      paddingVertical: 16, alignItems: 'center', gap: 8,
                      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
                    }}
                  >
                    <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: qa.bg + '18',
                      alignItems: 'center', justifyContent: 'center' }}>
                      <qa.icon size={18} color={qa.bg} />
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#62737a', textAlign: 'center' }}>
                      {qa.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Recent Gigs ── */}
              {recentGigs.length > 0 && (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#1c2b2c', letterSpacing: -0.3 }}>
                      Your Gigs
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/(business)/my-gigs')}>
                      <Text style={{ color: '#6d9c9f', fontWeight: '700', fontSize: 14 }}>View All</Text>
                    </TouchableOpacity>
                  </View>

                  {recentGigs.map(gig => {
                    const cfg = STATUS_BADGE[gig.status] || STATUS_BADGE.OPEN;
                    const budget = (gig.minBudget && gig.maxBudget && gig.minBudget !== gig.maxBudget)
                      ? `₹${gig.minBudget.toLocaleString('en-IN')} – ₹${gig.maxBudget.toLocaleString('en-IN')}`
                      : `₹${(gig.budgetAmount || 0).toLocaleString('en-IN')}`;
                    return (
                      <View key={gig.id} style={{
                        backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 10,
                        shadowColor: '#6d9c9f', shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
                      }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Text style={{ fontSize: 15, fontWeight: '800', color: '#1c2b2c', flex: 1, marginRight: 10 }}
                            numberOfLines={2}>
                            {gig.title}
                          </Text>
                          <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                            <Text style={{ color: cfg.text, fontSize: 10, fontWeight: '800' }}>{cfg.label}</Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                              <Users size={13} color="#6d9c9f" />
                              <Text style={{ color: '#62737a', fontSize: 12, fontWeight: '700' }}>
                                {gig._count?.applications ?? 0} apps
                              </Text>
                            </View>
                            <Text style={{ color: '#62737a', fontSize: 12, fontWeight: '700' }}>{budget}</Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => router.push('/(business)/applications' as any)}
                            style={{ backgroundColor: '#6d9c9f', borderRadius: 10, padding: 6 }}
                          >
                            <ChevronRight size={14} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </>
              )}

              {/* ── Top Applicants ── */}
              {topApplicants.length > 0 && (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    marginTop: 20, marginBottom: 16 }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#1c2b2c', letterSpacing: -0.3 }}>
                      Recent Applicants
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/(business)/applications' as any)}>
                      <Text style={{ color: '#6d9c9f', fontWeight: '700', fontSize: 14 }}>Review All</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ backgroundColor: 'white', borderRadius: 20,
                    shadowColor: '#6d9c9f', shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                    marginBottom: 20 }}>
                    {topApplicants.map((a, idx) => (
                      <View key={a.id} style={{
                        flexDirection: 'row', alignItems: 'center', gap: 12,
                        padding: 14,
                        borderBottomWidth: idx < topApplicants.length - 1 ? 1 : 0,
                        borderBottomColor: '#f1f5f9',
                      }}>
                        <LinearGradient colors={['#6d9c9f', '#2d7a7e']} style={{
                          width: 42, height: 42, borderRadius: 13,
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Text style={{ color: 'white', fontWeight: '900', fontSize: 14 }}>{a.initials}</Text>
                        </LinearGradient>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '800', color: '#1c2b2c', fontSize: 14 }}>{a.name}</Text>
                          <Text style={{ color: '#62737a', fontSize: 12, fontWeight: '600', marginTop: 1 }} numberOfLines={1}>
                            {a.headline}
                          </Text>
                        </View>
                        {a.rating !== '—' && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={{ color: '#f59e0b', fontSize: 14 }}>★</Text>
                            <Text style={{ color: '#1c2b2c', fontWeight: '800', fontSize: 13 }}>{a.rating}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                    <TouchableOpacity
                      onPress={() => router.push('/(business)/applications' as any)}
                      style={{ padding: 14, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9' }}
                    >
                      <Text style={{ color: '#6d9c9f', fontWeight: '800', fontSize: 14 }}>
                        View all {stats?.totalApplications || ''} applications →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* ── Recent Activity ── */}
              {activity.length > 0 && (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#1c2b2c', letterSpacing: -0.3 }}>
                      Recent Activity
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/(business)/notifications' as any)}>
                      <Text style={{ color: '#6d9c9f', fontWeight: '700', fontSize: 14 }}>See All</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ backgroundColor: 'white', borderRadius: 20,
                    shadowColor: '#6d9c9f', shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                    {activity.map((item, idx) => (
                      <View key={item.id} style={{
                        flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14,
                        borderBottomWidth: idx < activity.length - 1 ? 1 : 0,
                        borderBottomColor: '#f1f5f9',
                      }}>
                        <View style={{
                          width: 8, height: 8, borderRadius: 4, marginTop: 5,
                          backgroundColor: item.isRead ? '#cbd5e1' : '#6d9c9f',
                        }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 13, fontWeight: item.isRead ? '700' : '800', color: '#1c2b2c' }}
                            numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 1 }}
                            numberOfLines={1}>
                            {item.message}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600', flexShrink: 0 }}>
                          {timeAgo(item.createdAt)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Empty state */}
              {recentGigs.length === 0 && !isLoading && (
                <View style={{
                  backgroundColor: 'white', borderRadius: 24, padding: 32,
                  alignItems: 'center', marginTop: 16,
                  shadowColor: '#6d9c9f', shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
                }}>
                  <View style={{ backgroundColor: '#f0f9fa', borderRadius: 30, padding: 20, marginBottom: 16 }}>
                    <Zap size={40} color="#6d9c9f" />
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: '#1c2b2c', marginBottom: 8, textAlign: 'center' }}>
                    Post Your First Gig!
                  </Text>
                  <Text style={{ color: '#62737a', textAlign: 'center', lineHeight: 22, marginBottom: 20, fontSize: 14 }}>
                    Connect with top freelancers and get your project done efficiently.
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/(business)/post-gig')}
                    style={{ backgroundColor: '#6d9c9f', borderRadius: 18, paddingVertical: 14, paddingHorizontal: 28 }}
                  >
                    <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>Post a Gig Now →</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
