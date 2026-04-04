import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Briefcase, FileText, ChevronRight, AlertCircle,
  Clock, IndianRupee, CheckCircle2, XCircle
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../lib/api';

interface Contract {
  id: string;
  title?: string;
  status: string;
  budgetAmount: number;
  startDate?: string;
  endDate?: string;
  gig: {
    title: string;
    category: string;
  };
  business: {
    name: string;
    companyName: string | null;
  };
}

type ContractTab = 'ACTIVE' | 'COMPLETED' | 'TERMINATED';

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  ACTIVE:     { bg: '#ecfdf5', text: '#059669', icon: CheckCircle2, label: '🟢 Active' },
  PENDING:    { bg: '#fef3c7', text: '#d97706', icon: Clock,        label: '🟡 Pending' },
  COMPLETED:  { bg: '#f0f9fa', text: '#2d7a7e', icon: CheckCircle2, label: '✅ Completed' },
  TERMINATED: { bg: '#fef2f2', text: '#dc2626', icon: XCircle,      label: '❌ Terminated' },
  DISPUTED:   { bg: '#fff7ed', text: '#ea580c', icon: AlertCircle,  label: '⚠️ Disputed' },
};

function ContractCard({ item, onPress }: { item: Contract; onPress: () => void }) {
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.ACTIVE;
  const StatusIcon = cfg.icon;

  const duration = (() => {
    if (!item.startDate) return null;
    const start = new Date(item.startDate);
    const end = item.endDate ? new Date(item.endDate) : null;
    const startStr = start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const endStr = end ? end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Ongoing';
    return `${startStr} → ${endStr}`;
  })();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: 'white', borderRadius: 22, padding: 20,
        marginBottom: 14, shadowColor: '#6d9c9f',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07,
        shadowRadius: 8, elevation: 3,
      }}
    >
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

      <Text style={{ fontSize: 17, fontWeight: '800', color: '#1c2b2c', lineHeight: 23, marginBottom: 6 }}
        numberOfLines={2}>{item.gig?.title || item.title || 'Contract'}</Text>

      <Text style={{ color: '#62737a', fontSize: 13, fontWeight: '600', marginBottom: 14 }}>
        Client: {item.business?.companyName || item.business?.name || 'Unknown'}
      </Text>

      {duration && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <Clock size={13} color="#94a3b8" />
          <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600' }}>{duration}</Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 14, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <IndianRupee size={15} color="#2d7a7e" />
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#2d7a7e' }}>
            {item.budgetAmount?.toLocaleString()}
          </Text>
        </View>
        <View style={{ backgroundColor: '#6d9c9f', borderRadius: 12, padding: 8 }}>
          <ChevronRight size={16} color="white" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function FreelancerContracts() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ContractTab>('ACTIVE');

  const fetchContracts = useCallback(async () => {
    try {
      const response = await api.get('/api/freelancer/contracts');
      const rawContracts = response.data?.data || response.data || [];
      
      const mappedContracts: Contract[] = rawContracts.map((c: any) => ({
        id: c.id,
        status: c.status,
        budgetAmount: c.agreedPrice || 0,
        startDate: c.startedAt,
        endDate: c.deadline,
        gig: {
          title: c.gig?.title || 'Contract',
          category: 'Freelance', // Backend doesn't explicitly return category here, default to Freelance
        },
        business: {
          name: c.gig?.business?.name || 'User',
          companyName: c.gig?.business?.companyName || null,
        },
      }));

      setContracts(mappedContracts);
    } catch (err) {
      console.error('Contracts fetch error:', err);
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
    { key: 'TERMINATED', label: 'Ended' },
  ];

  const filtered = contracts.filter(c => {
    if (activeTab === 'ACTIVE') return c.status === 'ACTIVE' || c.status === 'PENDING';
    if (activeTab === 'COMPLETED') return c.status === 'COMPLETED';
    if (activeTab === 'TERMINATED') return c.status === 'TERMINATED' || c.status === 'DISPUTED';
    return true;
  });

  const counts = {
    ACTIVE: contracts.filter(c => c.status === 'ACTIVE' || c.status === 'PENDING').length,
    COMPLETED: contracts.filter(c => c.status === 'COMPLETED').length,
    TERMINATED: contracts.filter(c => c.status === 'TERMINATED' || c.status === 'DISPUTED').length,
  };

  const totalEarned = contracts
    .filter(c => c.status === 'COMPLETED')
    .reduce((acc, c) => acc + (c.budgetAmount || 0), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafa' }}>
      {/* Header */}
      <LinearGradient
        colors={['#1c2b2c', '#2d4547']}
        style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
      >
        <Text style={{ fontSize: 24, fontWeight: '900', color: 'white', letterSpacing: -0.5, marginBottom: 16 }}>
          My Contracts
        </Text>

        {/* Earnings summary */}
        {totalEarned > 0 && (
          <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 18,
            padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700',
                textTransform: 'uppercase', letterSpacing: 0.8 }}>Total Earned</Text>
              <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', marginTop: 2 }}>
                ₹{totalEarned.toLocaleString()}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700',
                textTransform: 'uppercase', letterSpacing: 0.8 }}>Active Now</Text>
              <Text style={{ color: '#6d9c9f', fontSize: 22, fontWeight: '900', marginTop: 2 }}>
                {counts.ACTIVE}
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: 'white', borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9', paddingHorizontal: 16 }}>
        {TABS.map((tab) => (
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
          renderItem={({ item }) => <ContractCard item={item} onPress={() => {}} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6d9c9f" />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 }}>
              <View style={{ backgroundColor: '#f0f9fa', borderRadius: 30, padding: 24, marginBottom: 20 }}>
                <Briefcase size={44} color="#6d9c9f" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#1c2b2c', marginBottom: 8 }}>
                No {activeTab === 'ACTIVE' ? 'Active' : activeTab === 'COMPLETED' ? 'Completed' : 'Ended'} Contracts
              </Text>
              <Text style={{ color: '#62737a', textAlign: 'center', lineHeight: 22, fontSize: 14 }}>
                {activeTab === 'ACTIVE'
                  ? 'You don\'t have any active contracts yet. Browse gigs to start applying!'
                  : 'No contracts in this category.'}
              </Text>
              {activeTab === 'ACTIVE' && (
                <TouchableOpacity
                  onPress={() => router.push('/(freelancer)/browse-gigs')}
                  style={{ backgroundColor: '#6d9c9f', borderRadius: 18,
                    paddingVertical: 14, paddingHorizontal: 28, marginTop: 20 }}
                >
                  <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>Browse Gigs →</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
