import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  RefreshControl, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, IndianRupee, Briefcase, Download, ArrowUpRight } from 'lucide-react-native';
import api from '../../lib/api';

const { width } = Dimensions.get('window');

interface EarningsData {
  totalEarnings: number;
  pendingPayout: number;
  thisMonth: number;
  lastMonth: number;
  contracts: {
    id: string;
    gigTitle: string;
    businessName: string;
    amount: number;
    status: string;
    completedAt: string;
  }[];
}

// Simple bar chart (no external libs)
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const barWidth = (width - 80) / data.length - 8;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 120, marginTop: 12 }}>
      {data.map((d, i) => {
        const h = Math.max((d.value / max) * 100, 4);
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '700', marginBottom: 4 }}>
              {d.value > 0 ? `₹${d.value >= 1000 ? `${(d.value / 1000).toFixed(0)}k` : d.value}` : ''}
            </Text>
            <LinearGradient
              colors={['#6d9c9f', '#2d7a7e']}
              style={{ width: '100%', height: h, borderRadius: 8 }}
            />
            <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '700', marginTop: 5 }}>
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function FreelancerEarnings() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [earnPeriod, setEarnPeriod] = useState<'week' | 'month' | 'year'>('month');

  const fetchEarnings = useCallback(async () => {
    try {
      const res = await api.get('/api/freelancer/earnings');
      setData(res.data?.data || null);
    } catch (err) {
      // If endpoint not ready, use placeholder structure
      setData({
        totalEarnings: 0,
        pendingPayout: 0,
        thisMonth: 0,
        lastMonth: 0,
        contracts: [],
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEarnings(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchEarnings(); };

  // Mock chart data based on period until real API is available
  const chartData = earnPeriod === 'week'
    ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(l => ({ label: l, value: 0 }))
    : earnPeriod === 'month'
    ? Array.from({ length: 4 }, (_, i) => ({ label: `W${i+1}`, value: 0 }))
    : MONTH_LABELS.map(l => ({ label: l, value: 0 }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafa' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6d9c9f" />}
      >
        {/* Header */}
        <LinearGradient
          colors={['#1c2b2c', '#2d4547']}
          style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 }}
        >
          <Text style={{ fontSize: 24, fontWeight: '900', color: 'white', letterSpacing: -0.5, marginBottom: 22 }}>
            Earnings
          </Text>

          {isLoading
            ? <ActivityIndicator color="#6d9c9f" />
            : (
              <>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700',
                  textTransform: 'uppercase', letterSpacing: 0.8 }}>Total Earned</Text>
                <Text style={{ color: 'white', fontSize: 40, fontWeight: '900', letterSpacing: -1, marginVertical: 6 }}>
                  ₹{(data?.totalEarnings ?? 0).toLocaleString()}
                </Text>

                <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                  <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 14 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700',
                      textTransform: 'uppercase', letterSpacing: 0.8 }}>This Month</Text>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: '900', marginTop: 4 }}>
                      ₹{(data?.thisMonth ?? 0).toLocaleString()}
                    </Text>
                    {(data?.thisMonth ?? 0) > (data?.lastMonth ?? 0) && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 }}>
                        <ArrowUpRight size={12} color="#22c55e" />
                        <Text style={{ color: '#22c55e', fontSize: 11, fontWeight: '700' }}>vs last month</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 14 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700',
                      textTransform: 'uppercase', letterSpacing: 0.8 }}>Pending</Text>
                    <Text style={{ color: '#f59e0b', fontSize: 20, fontWeight: '900', marginTop: 4 }}>
                      ₹{(data?.pendingPayout ?? 0).toLocaleString()}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4, fontWeight: '600' }}>
                      Processing
                    </Text>
                  </View>
                </View>

                {/* Withdraw button */}
                {(data?.pendingPayout ?? 0) > 0 && (
                  <TouchableOpacity style={{ backgroundColor: '#6d9c9f', borderRadius: 16,
                    paddingVertical: 14, alignItems: 'center', marginTop: 14,
                    flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                    <Download size={18} color="white" />
                    <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>
                      Withdraw ₹{(data?.pendingPayout ?? 0).toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )
          }
        </LinearGradient>

        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          {/* Earnings chart */}
          <View style={{ backgroundColor: 'white', borderRadius: 22, padding: 20,
            marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontWeight: '900', color: '#1c2b2c', fontSize: 16 }}>Earnings Chart</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {(['week', 'month', 'year'] as const).map((p) => (
                  <TouchableOpacity key={p} onPress={() => setEarnPeriod(p)}
                    style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
                      backgroundColor: earnPeriod === p ? '#6d9c9f' : '#f8fafa',
                      borderWidth: 1, borderColor: earnPeriod === p ? '#6d9c9f' : '#e2e8f0' }}>
                    <Text style={{ fontSize: 11, fontWeight: '700',
                      color: earnPeriod === p ? 'white' : '#94a3b8', textTransform: 'capitalize' }}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <BarChart data={chartData} />
          </View>

          {/* Recent contracts / payments */}
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#1c2b2c', marginBottom: 14, letterSpacing: -0.3 }}>
            Payment History
          </Text>

          {isLoading ? (
            <ActivityIndicator color="#6d9c9f" />
          ) : (data?.contracts ?? []).length === 0 ? (
            <View style={{ backgroundColor: 'white', borderRadius: 22, padding: 32,
              alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <IndianRupee size={40} color="#d8e4e5" />
              <Text style={{ color: '#94a3b8', marginTop: 12, fontWeight: '600', textAlign: 'center', lineHeight: 22 }}>
                No payment history yet.{'\n'}Complete contracts to see your earnings here.
              </Text>
            </View>
          ) : (
            (data?.contracts ?? []).map((c) => (
              <View key={c.id} style={{ backgroundColor: 'white', borderRadius: 18, padding: 18,
                marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04, shadowRadius: 5, elevation: 2,
                flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#ecfdf5',
                  alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={22} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '800', color: '#1c2b2c', fontSize: 14 }} numberOfLines={1}>
                    {c.gigTitle}
                  </Text>
                  <Text style={{ color: '#62737a', fontSize: 12, fontWeight: '600', marginTop: 2 }}>
                    {c.businessName} · {new Date(c.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <Text style={{ fontSize: 17, fontWeight: '900', color: '#059669' }}>
                  +₹{c.amount.toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
