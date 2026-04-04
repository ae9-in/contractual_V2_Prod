import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, Alert
} from 'react-native';
import {
  CreditCard, Wallet, Plus, ChevronRight, CheckCircle2,
  ArrowLeft, IndianRupee, TrendingUp, Clock, Receipt
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../lib/api';

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  exp: string;
  isDefault: boolean;
}

interface BillingData {
  plan: string;
  totalSpent: number;
  thisMonth: number;
  invoices: {
    id: string;
    amount: number;
    description: string;
    date: string;
    status: 'PAID' | 'PENDING' | 'FAILED';
  }[];
}

const INVOICE_STATUS: Record<string, { bg: string; text: string }> = {
  PAID:    { bg: '#ecfdf5', text: '#059669' },
  PENDING: { bg: '#fef3c7', text: '#d97706' },
  FAILED:  { bg: '#fef2f2', text: '#dc2626' },
};

export default function BillingScreen() {
  const router = useRouter();
  const [data, setData] = useState<BillingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Static cards until Stripe integration
  const cards: PaymentMethod[] = [
    { id: '1', last4: '4242', brand: 'Visa', exp: '12/26', isDefault: true },
    { id: '2', last4: '8888', brand: 'Mastercard', exp: '08/25', isDefault: false },
  ];

  const fetchBilling = useCallback(async () => {
    try {
      // Try to get business spending data from contracts
      const res = await api.get('/api/contracts/business');
      const contracts = res.data?.data || [];
      const totalSpent = contracts.reduce((acc: number, c: any) => acc + (c.budgetAmount || 0), 0);
      const currentMonth = new Date().getMonth();
      const thisMonth = contracts
        .filter((c: any) => new Date(c.createdAt).getMonth() === currentMonth)
        .reduce((acc: number, c: any) => acc + (c.budgetAmount || 0), 0);

      setData({
        plan: 'Pro Business',
        totalSpent,
        thisMonth,
        invoices: contracts.slice(0, 5).map((c: any) => ({
          id: c.id,
          amount: c.budgetAmount || 0,
          description: c.gig?.title || 'Contract Payment',
          date: c.createdAt,
          status: c.status === 'COMPLETED' ? 'PAID' : 'PENDING',
        })),
      });
    } catch (err) {
      setData({ plan: 'Pro Business', totalSpent: 0, thisMonth: 0, invoices: [] });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchBilling(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchBilling(); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafa' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6d9c9f" />}
      >
        {/* Header */}
        <LinearGradient
          colors={['#6d9c9f', '#2d7a7e']}
          style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 }}>
            <TouchableOpacity onPress={() => router.back()}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 8 }}>
              <ArrowLeft size={20} color="white" />
            </TouchableOpacity>
            <Text style={{ fontSize: 22, fontWeight: '900', color: 'white', letterSpacing: -0.5 }}>
              Billing & Payments
            </Text>
          </View>

          {isLoading ? <ActivityIndicator color="white" /> : (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 18, padding: 16 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700',
                  textTransform: 'uppercase', letterSpacing: 0.8 }}>Total Spent</Text>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', marginTop: 4 }}>
                  ₹{(data?.totalSpent ?? 0).toLocaleString()}
                </Text>
              </View>
              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 18, padding: 16 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700',
                  textTransform: 'uppercase', letterSpacing: 0.8 }}>This Month</Text>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', marginTop: 4 }}>
                  ₹{(data?.thisMonth ?? 0).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>

        <View style={{ paddingHorizontal: 24, paddingTop: 24, marginTop: -16 }}>
          {/* Current Plan */}
          <LinearGradient
            colors={['#1c2b2c', '#2d4547']}
            style={{ borderRadius: 24, padding: 24, marginBottom: 24 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700',
                  textTransform: 'uppercase', letterSpacing: 0.8 }}>Current Plan</Text>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', fontStyle: 'italic', marginTop: 4 }}>
                  {data?.plan || 'Pro Business'}
                </Text>
              </View>
              <View style={{ backgroundColor: '#6d9c9f', borderRadius: 14, padding: 10 }}>
                <CheckCircle2 size={22} color="white" />
              </View>
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 22, fontSize: 13, marginBottom: 18 }}>
              Unlimited gig postings, priority support, advanced analytics and escrow-ready workflows.
            </Text>
            <TouchableOpacity style={{ backgroundColor: '#6d9c9f', borderRadius: 16,
              paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 14 }}>Upgrade Plan →</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Payment Methods */}
          <Text style={{ fontSize: 16, fontWeight: '900', color: '#1c2b2c', marginBottom: 14, letterSpacing: -0.3 }}>
            Payment Methods
          </Text>

          {cards.map((card) => (
            <TouchableOpacity key={card.id} style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'white', borderRadius: 18, padding: 16,
              marginBottom: 10, gap: 14,
              shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
              borderWidth: card.isDefault ? 1.5 : 1,
              borderColor: card.isDefault ? '#6d9c9f' : '#f1f5f9',
            }}>
              <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#f0f9fa',
                alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={24} color="#6d9c9f" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#1c2b2c' }}>
                  {card.brand} •••• {card.last4}
                </Text>
                <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600', marginTop: 2 }}>
                  Expires {card.exp}
                </Text>
              </View>
              {card.isDefault && (
                <View style={{ backgroundColor: '#ecfdf5', borderRadius: 10,
                  paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ color: '#059669', fontSize: 11, fontWeight: '800' }}>Default</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            borderWidth: 2, borderStyle: 'dashed', borderColor: '#d8e4e5',
            borderRadius: 18, paddingVertical: 16, gap: 8, marginBottom: 28,
          }}>
            <Plus size={18} color="#6d9c9f" />
            <Text style={{ color: '#6d9c9f', fontWeight: '800', fontSize: 14 }}>Add Payment Method</Text>
          </TouchableOpacity>

          {/* Invoice History */}
          <Text style={{ fontSize: 16, fontWeight: '900', color: '#1c2b2c', marginBottom: 14, letterSpacing: -0.3 }}>
            Payment History
          </Text>

          {isLoading ? (
            <ActivityIndicator color="#6d9c9f" />
          ) : (data?.invoices ?? []).length === 0 ? (
            <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 28, alignItems: 'center',
              shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 5, elevation: 2 }}>
              <Receipt size={36} color="#d8e4e5" />
              <Text style={{ color: '#94a3b8', marginTop: 12, fontWeight: '600', textAlign: 'center' }}>
                No payment history yet.
              </Text>
            </View>
          ) : (
            (data?.invoices ?? []).map((inv) => {
              const cfg = INVOICE_STATUS[inv.status] || INVOICE_STATUS.PENDING;
              const date = new Date(inv.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
              return (
                <View key={inv.id} style={{ backgroundColor: 'white', borderRadius: 18, padding: 16,
                  marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 14,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04, shadowRadius: 5, elevation: 2 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#f0f9fa',
                    alignItems: 'center', justifyContent: 'center' }}>
                    <IndianRupee size={20} color="#6d9c9f" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '800', color: '#1c2b2c', fontSize: 14 }} numberOfLines={1}>
                      {inv.description}
                    </Text>
                    <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600', marginTop: 2 }}>{date}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 5 }}>
                    <Text style={{ fontWeight: '900', color: '#1c2b2c', fontSize: 15 }}>
                      ₹{inv.amount.toLocaleString()}
                    </Text>
                    <View style={{ backgroundColor: cfg.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ color: cfg.text, fontSize: 10, fontWeight: '800' }}>{inv.status}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
