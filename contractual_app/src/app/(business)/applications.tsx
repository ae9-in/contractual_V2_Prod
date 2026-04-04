import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  ActivityIndicator, RefreshControl, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Users, Search, CheckCircle2, Clock, Star,
  MapPin, Briefcase, MessageSquare, Eye, ChevronLeft
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../lib/api';

interface Applicant {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
  proposal: string;
  deliveryDays: number | null;
  freelancer: {
    id: string;
    name: string;
    headline: string | null;
    image: string | null;
    location: string | null;
    isVerified: boolean;
    reviewAvg: number | null;
    reviewCount: number;
    skills: { name: string }[];
  };
  gig: {
    id: string;
    title: string;
    budgetAmount: number;
    minBudget: number | null;
    maxBudget: number | null;
  };
}

type FilterStatus = 'all' | 'PENDING' | 'ACCEPTED' | 'REJECTED';

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  PENDING:   { bg: '#dbeafe', text: '#1d4ed8', label: 'New' },
  ACCEPTED:  { bg: '#dcfce7', text: '#166534', label: 'Accepted' },
  REJECTED:  { bg: '#f1f5f9', text: '#64748b', label: 'Declined' },
  WITHDRAWN: { bg: '#f1f5f9', text: '#64748b', label: 'Withdrawn' },
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(ms / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatBudget(gig: Applicant['gig']): string {
  if (gig.minBudget && gig.maxBudget && gig.minBudget !== gig.maxBudget) {
    return `₹${gig.minBudget.toLocaleString()} – ₹${gig.maxBudget.toLocaleString()}`;
  }
  return `₹${(gig.budgetAmount || gig.minBudget || 0).toLocaleString()}`;
}

function ApplicantCard({ item }: { item: Applicant }) {
  const router = useRouter();
  const initials = item.freelancer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;

  return (
    <View style={{
      backgroundColor: 'white', borderRadius: 22, padding: 20,
      marginBottom: 14, shadowColor: '#6d9c9f',
      shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08,
      shadowRadius: 10, elevation: 3,
    }}>
      {/* Top row */}
      <View style={{ flexDirection: 'row', gap: 14, marginBottom: 14 }}>
        {/* Avatar */}
        <View style={{ position: 'relative' }}>
          <View style={{
            width: 56, height: 56, borderRadius: 18,
            backgroundColor: '#f0f9fa', overflow: 'hidden',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {item.freelancer.image
              ? <Image source={{ uri: item.freelancer.image }} style={{ width: 56, height: 56 }} />
              : (
                <LinearGradient colors={['#6d9c9f', '#2d7a7e']} style={{
                  width: 56, height: 56, alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>{initials}</Text>
                </LinearGradient>
              )
            }
          </View>
          {item.freelancer.isVerified && (
            <View style={{
              position: 'absolute', bottom: -3, right: -3,
              backgroundColor: 'white', borderRadius: 10, padding: 1,
            }}>
              <CheckCircle2 size={14} color="#6d9c9f" />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#1c2b2c' }}>
              {item.freelancer.name}
            </Text>
            <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
              <Text style={{ color: cfg.text, fontSize: 10, fontWeight: '800' }}>{cfg.label}</Text>
            </View>
          </View>
          <Text style={{ color: '#62737a', fontSize: 13, fontWeight: '600', marginBottom: 6 }} numberOfLines={1}>
            {item.freelancer.headline || 'Freelancer'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
            {item.freelancer.reviewAvg != null && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Star size={13} color="#f59e0b" fill="#f59e0b" />
                <Text style={{ color: '#f59e0b', fontWeight: '800', fontSize: 12 }}>
                  {item.freelancer.reviewAvg.toFixed(1)}
                </Text>
                <Text style={{ color: '#94a3b8', fontSize: 11 }}>({item.freelancer.reviewCount})</Text>
              </View>
            )}
            {item.freelancer.location && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} color="#94a3b8" />
                <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600' }}>
                  {item.freelancer.location}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Budget */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 14, fontWeight: '900', color: '#6d9c9f' }}>
            {formatBudget(item.gig)}
          </Text>
          {item.deliveryDays && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 }}>
              <Clock size={11} color="#94a3b8" />
              <Text style={{ color: '#94a3b8', fontSize: 11 }}>{item.deliveryDays}d</Text>
            </View>
          )}
        </View>
      </View>

      {/* Skills */}
      {item.freelancer.skills.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {item.freelancer.skills.slice(0, 5).map(s => (
            <View key={s.name} style={{
              backgroundColor: '#f0f9fa', borderRadius: 10,
              paddingHorizontal: 10, paddingVertical: 4,
            }}>
              <Text style={{ color: '#2d7a7e', fontSize: 11, fontWeight: '700' }}>{s.name}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Gig applied for */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#f8fafa', borderRadius: 12, padding: 10, marginBottom: 10,
      }}>
        <Briefcase size={13} color="#6d9c9f" />
        <Text style={{ color: '#62737a', fontSize: 12, flex: 1 }} numberOfLines={1}>
          <Text style={{ fontWeight: '600' }}>Applied for: </Text>
          <Text style={{ fontWeight: '800', color: '#1c2b2c' }}>{item.gig.title}</Text>
        </Text>
        <Text style={{ color: '#94a3b8', fontSize: 11 }}>{timeAgo(item.createdAt)}</Text>
      </View>

      {/* Proposal */}
      {item.proposal ? (
        <Text style={{
          color: '#475569', fontSize: 13, lineHeight: 20,
          backgroundColor: '#f8fafa', borderRadius: 12,
          padding: 10, marginBottom: 12,
        }} numberOfLines={3}>
          {item.proposal}
        </Text>
      ) : null}

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={() => router.push(`/(business)/messages` as any)}
          style={{
            flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            gap: 6, backgroundColor: '#6d9c9f', borderRadius: 14, paddingVertical: 11,
          }}
        >
          <MessageSquare size={15} color="white" />
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/(business)/applications/${item.gig.id}` as any)}
          style={{
            flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            gap: 6, backgroundColor: '#f0f9fa', borderRadius: 14, paddingVertical: 11,
            borderWidth: 1, borderColor: '#d8e4e5',
          }}
        >
          <Eye size={15} color="#6d9c9f" />
          <Text style={{ color: '#2d7a7e', fontWeight: '800', fontSize: 13 }}>Gig Applicants</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function BusinessApplications() {
  const router = useRouter();
  const [apps, setApps] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');

  const fetchApps = useCallback(async () => {
    try {
      const res = await api.get('/api/business/applications');
      setApps(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Applications fetch error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchApps(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchApps(); };

  const stats = useMemo(() => ({
    total: apps.length,
    pending: apps.filter(a => a.status === 'PENDING').length,
    accepted: apps.filter(a => a.status === 'ACCEPTED').length,
    rejected: apps.filter(a => a.status === 'REJECTED').length,
  }), [apps]);

  const filtered = useMemo(() => {
    return apps.filter(a => {
      if (filter !== 'all' && a.status !== filter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return a.freelancer.name.toLowerCase().includes(q) || a.gig.title.toLowerCase().includes(q);
      }
      return true;
    });
  }, [apps, filter, search]);

  const STAT_TABS: { key: FilterStatus; label: string; value: number; color: string }[] = [
    { key: 'all',      label: 'All',      value: stats.total,    color: '#6d9c9f' },
    { key: 'PENDING',  label: 'New',      value: stats.pending,  color: '#3b82f6' },
    { key: 'ACCEPTED', label: 'Accepted', value: stats.accepted, color: '#22c55e' },
    { key: 'REJECTED', label: 'Declined', value: stats.rejected, color: '#64748b' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafa' }}>
      {/* Header */}
      <LinearGradient
        colors={['#6d9c9f', '#2d7a7e']}
        style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 8 }}
          >
            <ChevronLeft size={20} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: 'white', letterSpacing: -0.5 }}>
              Applications
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', marginTop: 1 }}>
              {stats.total} total · {stats.pending} new
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
          borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, gap: 10,
        }}>
          <Search size={18} color="#6d9c9f" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or gig..."
            placeholderTextColor="#94a3b8"
            style={{ flex: 1, color: '#1c2b2c', fontWeight: '600', fontSize: 14 }}
          />
        </View>
      </LinearGradient>

      {/* Stat filter tabs */}
      <View style={{
        flexDirection: 'row', backgroundColor: 'white',
        borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
        paddingHorizontal: 8,
      }}>
        {STAT_TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setFilter(tab.key)}
            style={{
              flex: 1, paddingVertical: 12, alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: filter === tab.key ? '#6d9c9f' : 'transparent',
            }}
          >
            <Text style={{
              fontSize: 18, fontWeight: '900',
              color: filter === tab.key ? '#2d7a7e' : '#94a3b8',
            }}>
              {tab.value}
            </Text>
            <Text style={{
              fontSize: 10, fontWeight: '700',
              color: filter === tab.key ? '#6d9c9f' : '#94a3b8',
              marginTop: 1, textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6d9c9f" />
          <Text style={{ color: '#62737a', marginTop: 12, fontWeight: '600' }}>Loading applications...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={({ item }) => <ApplicantCard item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6d9c9f" />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 }}>
              <View style={{ backgroundColor: '#f0f9fa', borderRadius: 30, padding: 24, marginBottom: 20 }}>
                <Users size={44} color="#6d9c9f" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#1c2b2c', marginBottom: 8, textAlign: 'center' }}>
                {search ? 'No Results Found' : 'No Applications Yet'}
              </Text>
              <Text style={{ color: '#62737a', textAlign: 'center', lineHeight: 22, fontSize: 14 }}>
                {search
                  ? `No applicants match "${search}"`
                  : 'When freelancers apply to your gigs, they appear here in real time.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
