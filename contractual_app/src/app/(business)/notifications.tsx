import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell, CheckCheck, ChevronLeft, Briefcase, MessageSquare,
  FileText, Users, AlertCircle, Info
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
}

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

function getNotifIcon(type?: string) {
  switch (type) {
    case 'APPLICATION': return { Icon: Users, bg: '#eff6ff', color: '#3b82f6' };
    case 'CONTRACT': return { Icon: FileText, bg: '#f0fdf4', color: '#22c55e' };
    case 'MESSAGE': return { Icon: MessageSquare, bg: '#f0f9fa', color: '#6d9c9f' };
    case 'JOB': return { Icon: Briefcase, bg: '#fef3c7', color: '#d97706' };
    case 'ALERT': return { Icon: AlertCircle, bg: '#fef2f2', color: '#dc2626' };
    default: return { Icon: Info, bg: '#f0f9fa', color: '#6d9c9f' };
  }
}

function NotifItem({ item, onPress }: { item: Notification; onPress: () => void }) {
  const { Icon, bg, color } = getNotifIcon(item.type);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'flex-start', gap: 14,
        backgroundColor: item.isRead ? 'white' : '#f0fafa',
        borderRadius: 20, padding: 16, marginBottom: 10,
        shadowColor: '#6d9c9f',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: item.isRead ? 0.04 : 0.10,
        shadowRadius: 6, elevation: item.isRead ? 1 : 3,
        borderWidth: item.isRead ? 0 : 1,
        borderColor: item.isRead ? 'transparent' : '#d8e4e5',
      }}
    >
      {/* Icon */}
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: bg,
        alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
          <Text style={{ fontSize: 14, fontWeight: item.isRead ? '700' : '900', color: '#1c2b2c', flex: 1, marginRight: 8 }}
            numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600', flexShrink: 0 }}>
            {timeAgo(item.createdAt)}
          </Text>
        </View>
        <Text style={{ fontSize: 13, color: item.isRead ? '#94a3b8' : '#475569',
          lineHeight: 18, fontWeight: item.isRead ? '500' : '600' }}
          numberOfLines={2}>
          {item.message}
        </Text>
      </View>

      {/* Unread dot */}
      {!item.isRead && (
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#6d9c9f',
          marginTop: 4, flexShrink: 0 }} />
      )}
    </TouchableOpacity>
  );
}

export default function BusinessNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Notifications fetch error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifs(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchNotifs(); };

  const markAllRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafa' }}>
      {/* Header */}
      <LinearGradient
        colors={['#6d9c9f', '#2d7a7e']}
        style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 8 }}
            >
              <ChevronLeft size={20} color="white" />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 22, fontWeight: '900', color: 'white', letterSpacing: -0.5 }}>
                Notifications
              </Text>
              {unreadCount > 0 && (
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600', marginTop: 1 }}>
                  {unreadCount} unread
                </Text>
              )}
            </View>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllRead}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14,
                paddingHorizontal: 12, paddingVertical: 8,
                flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <CheckCheck size={16} color="white" />
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6d9c9f" />
          <Text style={{ color: '#62737a', marginTop: 12, fontWeight: '600' }}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={({ item }) => (
            <NotifItem item={item} onPress={() => {}} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6d9c9f" />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <View style={{ backgroundColor: '#f0f9fa', borderRadius: 30, padding: 24, marginBottom: 20 }}>
                <Bell size={44} color="#6d9c9f" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#1c2b2c', marginBottom: 8 }}>
                All Caught Up!
              </Text>
              <Text style={{ color: '#62737a', textAlign: 'center', lineHeight: 22, fontSize: 14 }}>
                You have no notifications yet. They'll appear here when you receive them.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
