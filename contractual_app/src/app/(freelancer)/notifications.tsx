import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, StyleSheet, 
  ActivityIndicator, RefreshControl, Alert, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ChevronLeft, Bell, UserPlus, Banknote, 
  MessageCircle, Star, AlertTriangle, FileCheck 
} from 'lucide-react-native';
import api from '../../lib/api';

function formatDistanceToNow(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) return 'just now';
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
};

const PROPOSAL_TYPES = new Set([
  "APPLICATION_RECEIVED",
  "APPLICATION_ACCEPTED",
  "APPLICATION_REJECTED",
]);

const PAYMENT_TYPES = new Set(["PAYMENT_RELEASED"]);

const CONTRACT_TYPES = new Set([
  "CONTRACT_CREATED",
  "CONTRACT_COMPLETED",
  "SUBMISSION_RECEIVED",
  "REVISION_REQUESTED",
  "DISPUTE_OPENED",
  "DISPUTE_RESOLVED",
]);

function bucket(type: string) {
  if (PROPOSAL_TYPES.has(type)) return "proposals";
  if (PAYMENT_TYPES.has(type)) return "payments";
  if (CONTRACT_TYPES.has(type)) return "contracts";
  return "system";
}

function TypeIcon({ type }: { type: string }) {
  const size = 20;
  if (PROPOSAL_TYPES.has(type)) return <View style={[styles.iconWrap, { backgroundColor: '#e8f4f5' }]}><UserPlus size={size} color="#6d9c9f" /></View>;
  if (PAYMENT_TYPES.has(type)) return <View style={[styles.iconWrap, { backgroundColor: '#fef3c7' }]}><Banknote size={size} color="#d97706" /></View>;
  if (type === "MESSAGE_RECEIVED") return <View style={[styles.iconWrap, { backgroundColor: '#e0f2fe' }]}><MessageCircle size={size} color="#0284c7" /></View>;
  if (type === "REVIEW_RECEIVED") return <View style={[styles.iconWrap, { backgroundColor: '#fff7ed' }]}><Star size={size} color="#ea580c" /></View>;
  if (type === "DISPUTE_OPENED" || type === "DISPUTE_RESOLVED") return <View style={[styles.iconWrap, { backgroundColor: '#fef2f2' }]}><AlertTriangle size={size} color="#dc2626" /></View>;
  if (CONTRACT_TYPES.has(type)) return <View style={[styles.iconWrap, { backgroundColor: '#f0fdf4' }]}><FileCheck size={size} color="#16a34a" /></View>;
  
  return <View style={[styles.iconWrap, { backgroundColor: '#f1f5f9' }]}><Bell size={size} color="#64748b" /></View>;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'contracts' | 'proposals' | 'payments' | 'system'>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/api/notifications?limit=100');
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Fetch notifications error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchNotifications(); };

  const markAllRead = async () => {
    try {
      await api.patch('/api/notifications/read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const markOneRead = async (id: string, link?: string | null) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      if (link) {
        // Handle path mapping (e.g., convert web /freelancer/contracts/id to mobile route)
        if (link.includes('/contracts/')) {
          router.push('/(freelancer)/contracts' as any);
        } else if (link.includes('/messages/')) {
          router.push('/(freelancer)/messages' as any);
        } else {
          // Fallback or specific mapping
        }
      }
    } catch (err) {
      console.error('Mark one read error:', err);
    }
  };

  const counts = useMemo(() => ({
    all: notifications.length,
    contracts: notifications.filter(n => bucket(n.type) === 'contracts').length,
    proposals: notifications.filter(n => bucket(n.type) === 'proposals').length,
    payments: notifications.filter(n => bucket(n.type) === 'payments').length,
    system: notifications.filter(n => bucket(n.type) === 'system').length,
  }), [notifications]);

  const visibleNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter(n => bucket(n.type) === filter);
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#1c2b2c" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markReadAll}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'contracts', label: 'Contracts', count: counts.contracts },
            { id: 'proposals', label: 'Proposals', count: counts.proposals },
            { id: 'payments', label: 'Payments', count: counts.payments },
            { id: 'system', label: 'System', count: counts.system },
          ].map((item) => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => setFilter(item.id as any)}
              style={[styles.filterTab, filter === item.id && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, filter === item.id && styles.filterTabTextActive]}>
                {item.label} ({item.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#6d9c9f" /></View>
      ) : (
        <ScrollView 
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6d9c9f" />}
          contentContainerStyle={styles.listContent}
        >
          {visibleNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Bell size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySub}>We'll let you know when something important happens.</Text>
            </View>
          ) : (
            visibleNotifications.map((n) => (
              <TouchableOpacity 
                key={n.id} 
                onPress={() => markOneRead(n.id, n.link)}
                style={[styles.notificationCard, !n.isRead && styles.unreadCard]}
              >
                <TypeIcon type={n.type} />
                <View style={styles.notifContent}>
                  <Text style={styles.notifTitle}>{n.title}</Text>
                  <Text style={styles.notifMessage}>{n.message}</Text>
                  <Text style={styles.notifTime}>
                    {formatDistanceToNow(new Date(n.createdAt))}
                  </Text>
                </View>
                {!n.isRead && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1c2b2c',
    letterSpacing: -0.5,
  },
  unreadBadge: {
    backgroundColor: '#6d9c9f',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
  },
  markReadAll: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6d9c9f',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterTabActive: {
    backgroundColor: '#6d9c9f',
    borderColor: '#6d9c9f',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#1c2b2c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#f0f9fa',
    borderColor: '#6d9c9f40',
    borderLeftWidth: 4,
    borderLeftColor: '#6d9c9f',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  notifContent: {
    flex: 1,
    paddingRight: 8,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1c2b2c',
    marginBottom: 2,
  },
  notifMessage: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    marginTop: 6,
    textTransform: 'uppercase',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6d9c9f',
    marginTop: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1c2b2c',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 40,
    fontWeight: '600',
  },
});
