import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  FileText, ChevronRight, Clock, IndianRupee,
  CheckCircle2, XCircle, AlertCircle, ChevronLeft, User
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../lib/api';

interface BusinessContract {
  id: string;
  status: string;
  agreedPrice: number;
  startedAt: string | null;
  deadline: string | null;
  completedAt: string | null;
  gig: {
    title: string;
    category?: string;
  };
  freelancer: {
    name: string;
    headline: string | null;
  };
}

type ContractTab = 'ACTIVE' | 'COMPLETED' | 'ENDED';

const ACTIVE_STATUSES = ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED'];

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  PENDING:           { bg: '#fef3c7', text: '#d97706', icon: Clock,        label: '🟡 Pending' },
  IN_PROGRESS:       { bg: '#ecfdf5', text: '#059669', icon: CheckCircle2, label: '🟢 In Progress' },
  SUBMITTED:         { bg: '#eff6ff', text: '#2563eb', icon: FileText,     label: '📤 Submitted' },
  UNDER_REVIEW:      { bg: '#f0f9fa', text: '#2d7a7e', icon: AlertCircle,  label: '🔍 Under Review' },
  REVISION_REQUESTED: { bg: '#fff7ed', text: '#ea580c', icon: AlertCircle, label: '✏️ Revision' },
  COMPLETED:         { bg: '#f0fdf4', text: '#16a34a', icon: CheckCircle2, label: '✅ Completed' },
  CANCELLED:         { bg: '#fef2f2', text: '#dc2626', icon: XCircle,      label: '❌ Cancelled' },
  DISPUTED:          { bg: '#fff7ed', text: '#ea580c', icon: AlertCircle,  label: '⚠️ Disputed' },
};

function ContractCard({ item }: { item: BusinessContract }) {
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.IN_PROGRESS;
  const StatusIcon = cfg.icon;

  const duration = (() => {
    if (!item.startedAt) return null;
    const start = new Date(item.startedAt);
    const end = item.deadline ? new Date(item.deadline) : null;
    const startStr = start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const endStr = end ? end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Ongoing';
    return `${startStr} → ${endStr}`;
  })();

  const isDeadlineSoon = (() => {
    if (!item.deadline || item.status === 'COMPLETED') return false;
    const daysLeft = Math.ceil((new Date(item.deadline).getTime() - Date.now()) / 86400000);
    return daysLeft >= 0 && daysLeft <= 7;
  })();

  return (
    <View style={{
      backgroundColor: 'white', borderRadius: 22, padding: 20,
      marginBottom: 14, shadowColor: '#6d9c9f',
      shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08,
      shadowRadius: 10, elevation: 3,
      borderWidth: isDeadlineSoon ? 1 : 0,
      borderColor: isDeadlineSoon ? '#fde68a' : 'transparent',
    }}>
      {/* Header row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ backgroundColor: '#f0f9fa', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
          <Text style={{ color: '#6d9c9f', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>
            {item.gig?.category || 'Contract'}
          </Text>
        </View>
        <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
          flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <StatusIcon size={12} color={cfg.text} />
          <Text style={{ color: cfg.text, fontSize: 11, fontWeight: '800' }}>{cfg.label}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={{ fontSize: 17, fontWeight: '800', color: '#1c2b2c', lineHeight: 23, marginBottom: 6 }}
        numberOfLines={2}>
        {item.gig?.title || 'Contract'}
      </Text>

      {/* Freelancer */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <User size={13} color="#6d9c9f" />
        <Text style={{ color: '#62737a', fontSize: 13, fontWeight: '600' }}>
          {item.freelancer?.name || 'Freelancer'}
          {item.freelancer?.headline ? ` · ${item.freelancer.headline}` : ''}
        </Text>
      </View>

      {/* Duration */}
      {duration && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 }}>
          <Clock size={13} color="#94a3b8" />
          <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600' }}>{duration}</Text>
        </View>
      )}

      {isDeadlineSoon && (
        <View style={{ backgroundColor: '#fffbeb', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
          marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={13} color="#d97706" />
          <Text style={{ color: '#d97706', fontSize: 12, fontWeight: '700' }}>Deadline approaching</Text>
        </View>
      )}

      {/* Bottom */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 14, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <IndianRupee size={15} color="#2d7a7e" />
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#2d7a7e' }}>
            {(item.agreedPrice || 0).toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={{ backgroundColor: '#6d9c9f', borderRadius: 12, padding: 8 }}>
          <ChevronRight size={16} color="white" />
        </View>
      </View>
    </View>
  );
}

export default function BusinessContracts() {
  const router = useRouter();
  const [contracts, setContracts] = useState<BusinessContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ContractTab>('ACTIVE');

  const fetchContracts = useCallback(async () => {
    try {
      const res = await api.get('/api/contracts');
      const raw = res.data?.data || res.data || [];
      const mapped: BusinessContract[] = raw.map((c: any) => ({
        id: c.id,
        status: c.status,
        agreedPrice: c.agreedPrice || 0,
        startedAt: c.startedAt,
        deadline: c.deadline,
        completedAt: c.completedAt,
        gig: { title: c.gig?.title || 'Contract', category: c.gig?.category },
        freelancer: { name: c.freelancer?.name || 'Freelancer', headline: c.freelancer?.headline || null },
      }));
      setContracts(mapped);
    } catch (err) {
      console.error('Business contracts fetch error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchContracts(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchContracts(); };

  const TABS: { key: ContractTab; label: string }[] = [
    { key: 'ACTIVE', label: 'Active' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'ENDED', label: 'Ended' },
  ];

  const filtered = contracts.filter(c => {
    if (activeTab === 'ACTIVE') return ACTIVE_STATUSES.includes(c.status);
    if (activeTab === 'COMPLETED') return c.status === 'COMPLETED';
    return c.status === 'CANCELLED' || c.status === 'DISPUTED';
  });

  const counts = {
    ACTIVE: contracts.filter(c => ACTIVE_STATUSES.includes(c.status)).length,
    COMPLETED: contracts.filter(c => c.status === 'COMPLETED').length,
    ENDED: contracts.filter(c => c.status === 'CANCELLED' || c.status === 'DISPUTED').length,
  };

  const totalSpent = contracts
    .filter(c => c.status === 'COMPLETED')
    .reduce((acc, c) => acc + (c.agreedPrice || 0), 0);

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
          <Text style={{ fontSize: 22, fontWeight: '900', color: 'white', letterSpacing: -0.5 }}>
            Contracts
          </Text>
        </View>

        {/* Summary */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 18, padding: 16 }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700',
              textTransform: 'uppercase', letterSpacing: 0.8 }}>Total Spent</Text>
            <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', marginTop: 4 }}>
              ₹{totalSpent.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 18, padding: 16 }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700',
              textTransform: 'uppercase', letterSpacing: 0.8 }}>Active Now</Text>
            <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', marginTop: 4 }}>
              {counts.ACTIVE}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: 'white', borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9', paddingHorizontal: 16 }}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{ flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2,
              borderBottomColor: activeTab === tab.key ? '#6d9c9f' : 'transparent' }}
          >
            <Text style={{ fontWeight: '800', fontSize: 13,
              color: activeTab === tab.key ? '#2d7a7e' : '#94a3b8' }}>
              {tab.label}
            </Text>
            {counts[tab.key] > 0 && (
              <View style={{ backgroundColor: activeTab === tab.key ? '#6d9c9f' : '#f1f5f9',
                borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, marginTop: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '800',
                  color: activeTab === tab.key ? 'white' : '#94a3b8' }}>
                  {counts[tab.key]}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6d9c9f" />
          <Text style={{ color: '#62737a', marginTop: 12, fontWeight: '600' }}>Loading contracts...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={({ item }) => <ContractCard item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6d9c9f" />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 }}>
              <View style={{ backgroundColor: '#f0f9fa', borderRadius: 30, padding: 24, marginBottom: 20 }}>
                <FileText size={44} color="#6d9c9f" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#1c2b2c', marginBottom: 8, textAlign: 'center' }}>
                No {activeTab === 'ACTIVE' ? 'Active' : activeTab === 'COMPLETED' ? 'Completed' : 'Ended'} Contracts
              </Text>
              <Text style={{ color: '#62737a', textAlign: 'center', lineHeight: 22, fontSize: 14 }}>
                {activeTab === 'ACTIVE'
                  ? 'Accept an application to start a contract with a freelancer.'
                  : 'No contracts in this category yet.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
