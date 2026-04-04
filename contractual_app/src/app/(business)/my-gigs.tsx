import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  FlatList, TextInput, RefreshControl, Alert, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Briefcase, PlusCircle, Users, IndianRupee,
  Clock, Search, Trash2, Eye, Zap,
  BarChart3, Calendar, CheckCircle2, Pause,
  XCircle, Edit2, Star, MoreHorizontal,
  Copy, Play
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../lib/api';

interface GigRow {
  id: string;
  title: string;
  category: string;
  status: 'active' | 'paused' | 'closed' | 'draft';
  budget: { label: string; min: number; max: number };
  applicants: number;
  shortlisted: number;
  hired: number;
  views: number;
  posted: string;
  deadline: string;
  urgent: boolean;
  featured: boolean;
}

type CountSummary = {
  all: number; active: number; paused: number; draft: number; closed: number;
};
type StatSummary = {
  totalGigs: number; activeGigs: number; totalApplicants: number; totalViews: number;
};

type GigTab = 'all' | 'active' | 'paused' | 'draft' | 'closed';

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  active: { bg: '#dcfce7', text: '#166534', icon: CheckCircle2, label: 'Active' },
  paused: { bg: '#fef3c7', text: '#d97706', icon: Pause, label: 'Paused' },
  closed: { bg: '#f1f5f9', text: '#64748b', icon: XCircle, label: 'Closed' },
  draft:  { bg: '#dbeafe', text: '#1d4ed8', icon: Edit2, label: 'Draft' },
};

function KpiCard({
  label, value, icon: Icon, bg, iconColor
}: { label: string; value: number | string; icon: any; bg: string; iconColor: string; }) {
  return (
    <View style={{
      backgroundColor: 'white', borderRadius: 18, padding: 14,
      shadowColor: '#6d9c9f', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
      width: '48%', marginBottom: 14,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Text>
          <Text style={{ fontSize: 24, fontWeight: '900', color: '#1c2b2c', marginTop: 4 }}>
            {value}
          </Text>
        </View>
        <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={iconColor} />
        </View>
      </View>
    </View>
  );
}

function MetricBlock({ label, value, icon: Icon, bg, color }: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: '45%', marginBottom: 12 }}>
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={color} />
      </View>
      <View>
        <Text style={{ fontSize: 15, fontWeight: '800', color: '#1c2b2c' }}>{value}</Text>
        <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '700' }}>{label}</Text>
      </View>
    </View>
  );
}

export default function BusinessMyGigs() {
  const router = useRouter();
  const [gigs, setGigs] = useState<GigRow[]>([]);
  const [counts, setCounts] = useState<CountSummary>({ all: 0, active: 0, paused: 0, draft: 0, closed: 0 });
  const [stats, setStats] = useState<StatSummary>({ totalGigs: 0, activeGigs: 0, totalApplicants: 0, totalViews: 0 });
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<GigTab>('all');
  const [search, setSearch] = useState('');

  // Action Menu State
  const [selectedGig, setSelectedGig] = useState<GigRow | null>(null);

  const fetchGigs = useCallback(async () => {
    try {
      const response = await api.get('/api/business/my-gigs');
      if (response.data?.data) {
        setGigs(response.data.data.gigs || []);
        setCounts(response.data.data.counts || { all: 0, active: 0, paused: 0, draft: 0, closed: 0 });
        setStats(response.data.data.stats || { totalGigs: 0, activeGigs: 0, totalApplicants: 0, totalViews: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch gigs:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchGigs(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchGigs(); };

  const patchGigStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/gigs/${id}`, { status: newStatus });
      setSelectedGig(null);
      fetchGigs();
      Alert.alert('Success', `Gig marked as ${newStatus}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update gig status.');
    }
  };

  const deleteGig = async (id: string) => {
    Alert.alert('Delete Gig', 'Are you sure you want to delete this gig? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/api/gigs/${id}`);
          setSelectedGig(null);
          fetchGigs();
          Alert.alert('Success', 'Gig deleted.');
        } catch (err) {
          Alert.alert('Error', 'Failed to delete gig.');
        }
      }}
    ]);
  };

  const filtered = gigs.filter(g => {
    const matchesTab = activeTab === 'all' || g.status === activeTab;
    const matchesSearch = search.trim() === '' || g.title.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const TABS: GigTab[] = ['all', 'active', 'paused', 'draft', 'closed'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafa' }}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6d9c9f" />}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <>
            {/* ── HEADER & KPI CARDS ── */}
            <LinearGradient
              colors={['#6d9c9f', '#2d7a7e']}
              style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 50, zIndex: 0 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: '900', color: 'white', letterSpacing: -0.5 }}>My Gigs</Text>
                <TouchableOpacity
                  onPress={() => router.push('/(business)/post-gig')}
                  style={{ backgroundColor: 'white', borderRadius: 16,
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    paddingHorizontal: 14, paddingVertical: 10 }}
                >
                  <PlusCircle size={16} color="#2d7a7e" />
                  <Text style={{ color: '#2d7a7e', fontWeight: '800', fontSize: 13 }}>New Gig</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <KpiCard label="Total Gigs" value={stats.totalGigs} icon={BarChart3} bg="#f0f9fa" iconColor="#6d9c9f" />
                <KpiCard label="Active Gigs" value={stats.activeGigs} icon={Zap} bg="#ecfdf5" iconColor="#059669" />
                <KpiCard label="Total Apps" value={stats.totalApplicants} icon={Users} bg="#eff6ff" iconColor="#2563eb" />
                <KpiCard label="Total Views" value={stats.totalViews.toLocaleString()} icon={Eye} bg="#fffbeb" iconColor="#d97706" />
              </View>
            </LinearGradient>

            <View style={{ marginTop: -30, zIndex: 1, paddingHorizontal: 20 }}>
              {/* ── SEARCH & FILTER TABS ── */}
              <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 18,
                shadowColor: '#6d9c9f', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 }}>
                
                {/* Search */}
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc',
                  borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, gap: 10, marginBottom: 16 }}>
                  <Search size={18} color="#94a3b8" />
                  <TextInput
                    value={search} onChangeText={setSearch} placeholder="Search gigs..." placeholderTextColor="#94a3b8"
                    style={{ flex: 1, color: '#0f172a', fontWeight: '700', fontSize: 15 }}
                  />
                </View>

                {/* Tabs */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <FlatList
                    horizontal showsHorizontalScrollIndicator={false}
                    data={TABS} keyExtractor={(t) => t}
                    renderItem={({ item: tab }) => {
                      const isSelected = activeTab === tab;
                      return (
                        <TouchableOpacity
                          onPress={() => setActiveTab(tab)}
                          style={{
                            paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
                            backgroundColor: isSelected ? '#6d9c9f' : '#f1f5f9',
                            flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 8,
                          }}
                        >
                          <Text style={{ fontWeight: '800', fontSize: 13, textTransform: 'capitalize',
                            color: isSelected ? 'white' : '#64748b' }}>
                            {tab}
                          </Text>
                          {tab !== 'all' && (
                            <View style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'white', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                              <Text style={{ fontSize: 11, fontWeight: '800', color: isSelected ? 'white' : '#64748b' }}>
                                {counts[tab]}
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.active;
          const StatusIcon = cfg.icon;
          return (
            <View style={{
              backgroundColor: 'white', borderRadius: 24, padding: 20,
              marginHorizontal: 20, marginTop: 16,
              shadowColor: '#6d9c9f', shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
            }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 17, fontWeight: '900', color: '#1c2b2c' }}>{item.title}</Text>
                    <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                      <StatusIcon size={12} color={cfg.text} />
                      <Text style={{ color: cfg.text, fontSize: 10, fontWeight: '800' }}>{cfg.label}</Text>
                    </View>
                    {item.urgent && (
                      <View style={{ backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}>
                        <Text style={{ color: '#dc2626', fontSize: 10, fontWeight: '800' }}>Urgent</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Text style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, color: '#64748b', fontSize: 11, fontWeight: '700' }}>
                      {item.category}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} color="#94a3b8" />
                      <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600' }}>Posted {item.posted}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Metrics Grid */}
              <View style={{ marginLeft: 6, marginTop: 8, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  <MetricBlock label="Applicants" value={item.applicants} icon={Users} bg="#eff6ff" color="#2563eb" />
                  <MetricBlock label="Shortlisted" value={item.shortlisted} icon={CheckCircle2} bg="#ecfdf5" color="#059669" />
                  <MetricBlock label="Hired" value={item.hired} icon={Star} bg="#fffbeb" color="#d97706" />
                  <MetricBlock label="Views" value={item.views} icon={Eye} bg="#fdf4ff" color="#c026d3" />
                </View>
              </View>

              {/* Footer Actions */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                <View>
                  <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Budget</Text>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#6d9c9f' }}>{item.budget.label}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => router.push(`/(business)/applications/${item.id}` as any)}
                    style={{ backgroundColor: '#6d9c9f', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, flexDirection: 'row', gap: 6, alignItems: 'center' }}
                  >
                    <Users size={14} color="white" />
                    <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>View Apps</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSelectedGig(item)}
                    style={{ padding: 10, borderRadius: 14, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' }}
                  >
                    <MoreHorizontal size={18} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <View style={{ backgroundColor: '#f0f9fa', borderRadius: 30, padding: 24, marginBottom: 20 }}>
                <BarChart3 size={44} color="#6d9c9f" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#1c2b2c', marginBottom: 8 }}>No Gigs Found</Text>
              <Text style={{ color: '#62737a', textAlign: 'center', marginHorizontal: 40, lineHeight: 22 }}>
                You have no gigs in this category. Adjust filters or post a new gig.
              </Text>
            </View>
          ) : (
            <ActivityIndicator style={{ marginTop: 40 }} color="#6d9c9f" />
          )
        }
      />

      {/* Action Menu Bottom Sheet (Modal) */}
      <Modal visible={!!selectedGig} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setSelectedGig(null)} />
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#1c2b2c', marginBottom: 20, textAlign: 'center' }}>
              Gig Actions
            </Text>

            <TouchableOpacity onPress={() => { router.push(`/public/gig/${selectedGig?.id}` as any); setSelectedGig(null); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}><Eye size={18} color="#64748b" /></View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#0f172a' }}>View Gig Public Page</Text>
            </TouchableOpacity>

            {selectedGig?.status === 'active' && (
              <TouchableOpacity onPress={() => patchGigStatus(selectedGig.id, 'PAUSED')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#fffbeb', alignItems: 'center', justifyContent: 'center' }}><Pause size={18} color="#d97706" /></View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#0f172a' }}>Pause Gig</Text>
              </TouchableOpacity>
            )}
            
            {selectedGig?.status === 'paused' && (
              <TouchableOpacity onPress={() => patchGigStatus(selectedGig.id, 'OPEN')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' }}><Play size={18} color="#059669" /></View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#0f172a' }}>Activate Gig</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => selectedGig && deleteGig(selectedGig.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={18} color="#dc2626" /></View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#dc2626' }}>Delete Gig</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSelectedGig(null)} style={{ marginTop: 10, backgroundColor: '#f1f5f9', paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#64748b' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
