import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  ActivityIndicator, Image, RefreshControl, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  MessageSquare, Search, ChevronRight, Filter,
  CheckCheck, Circle, Send
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../lib/api';

interface Chat {
  id: string;
  recipientName: string;
  recipientImage: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  gigTitle?: string;
  isOnline?: boolean;
}

function timeFormat(iso: string): string {
  const now = new Date();
  const d = new Date(iso);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function ChatItem({ item, onPress }: { item: Chat; onPress: () => void }) {
  const initials = item.recipientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <TouchableOpacity onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'white', borderRadius: 20, padding: 16,
        marginBottom: 10, gap: 14,
        shadowColor: item.unreadCount > 0 ? '#6d9c9f' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: item.unreadCount > 0 ? 0.12 : 0.04,
        shadowRadius: 8, elevation: item.unreadCount > 0 ? 4 : 2,
        borderWidth: item.unreadCount > 0 ? 1 : 0,
        borderColor: item.unreadCount > 0 ? '#d8e4e5' : 'transparent',
      }}
    >
      {/* Avatar */}
      <View style={{ position: 'relative' }}>
        <View style={{
          width: 52, height: 52, borderRadius: 16, backgroundColor: '#e2e8f0',
          overflow: 'hidden', justifyContent: 'center', alignItems: 'center'
        }}>
          {item.recipientImage
            ? <Image source={{ uri: item.recipientImage }} style={{ width: 52, height: 52 }} />
            : <Text style={{ fontSize: 16, fontWeight: '900', color: '#6d9c9f' }}>{initials}</Text>
          }
        </View>
        {item.isOnline && (
          <View style={{
            position: 'absolute', bottom: 1, right: 1, width: 12, height: 12,
            borderRadius: 6, backgroundColor: '#22c55e', borderWidth: 2, borderColor: 'white'
          }} />
        )}
        {item.unreadCount > 0 && (
          <View style={{
            position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20,
            backgroundColor: '#6d9c9f', borderRadius: 10, borderWidth: 2, borderColor: 'white',
            justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4
          }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: '900' }}>
              {item.unreadCount > 9 ? '9+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{
            fontSize: 15, fontWeight: item.unreadCount > 0 ? '900' : '700',
            color: '#1c2b2c', flex: 1, marginRight: 8
          }} numberOfLines={1}>
            {item.recipientName}
          </Text>
          <Text style={{
            fontSize: 11, fontWeight: '600',
            color: item.unreadCount > 0 ? '#6d9c9f' : '#94a3b8'
          }}>
            {item.lastMessageTime ? timeFormat(item.lastMessageTime) : ''}
          </Text>
        </View>
        <Text style={{
          fontSize: 13, color: item.unreadCount > 0 ? '#374151' : '#94a3b8',
          fontWeight: item.unreadCount > 0 ? '600' : '500'
        }} numberOfLines={1}>
          {item.lastMessage || 'Start a conversation...'}
        </Text>
      </View>
      <ChevronRight size={16} color="#d8e4e5" />
    </TouchableOpacity>
  );
}

export default function MessagesScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchChats = useCallback(async () => {
    try {
      const response = await api.get('/api/messages/conversations');
      const rawChats = response.data?.data || response.data || [];

      const mappedChats: Chat[] = rawChats.map((c: any) => ({
        id: c.id,
        recipientName: c.peer?.name || 'User',
        recipientImage: c.peer?.image || null,
        lastMessage: c.lastMessage?.content || 'Start a conversation...',
        lastMessageTime: c.lastMessageAt || new Date().toISOString(),
        unreadCount: c.unread || 0,
        gigTitle: c.gigTitle || '',
        isOnline: false,
      }));

      setChats(mappedChats);
    } catch (err) {
      console.error('Messages fetch error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchChats(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchChats(); };

  const filtered = search.trim()
    ? chats.filter(c => c.recipientName.toLowerCase().includes(search.toLowerCase()))
    : chats;

  const totalUnread = chats.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafa' }}>
      {/* Header */}
      <LinearGradient
        colors={['#6d9c9f', '#2d7a7e']}
        style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: '900', color: 'white', letterSpacing: -0.5 }}>Messages</Text>
            {totalUnread > 0 && (
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600', marginTop: 2 }}>
                {totalUnread} unread message{totalUnread > 1 ? 's' : ''}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: 10 }}>
            <Filter size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
          borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, gap: 10
        }}>
          <Search size={18} color="#6d9c9f" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search conversations..."
            placeholderTextColor="#94a3b8"
            style={{ flex: 1, color: '#1c2b2c', fontWeight: '600', fontSize: 14 }}
          />
        </View>
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6d9c9f" />
          <Text style={{ color: '#62737a', marginTop: 12, fontWeight: '600' }}>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={({ item }) => (
            <ChatItem
              item={item}
              onPress={() => router.push({
                pathname: `/chat/${item.id}`,
                params: { name: item.recipientName, image: item.recipientImage || '', gigTitle: item.gigTitle || '' }
              })}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6d9c9f" />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 }}>
              <View style={{ backgroundColor: '#f0f9fa', borderRadius: 30, padding: 24, marginBottom: 20 }}>
                <MessageSquare size={44} color="#6d9c9f" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#1c2b2c', marginBottom: 8 }}>
                {search ? 'No Results' : 'No Messages Yet'}
              </Text>
              <Text style={{ color: '#62737a', textAlign: 'center', lineHeight: 22, fontSize: 14 }}>
                {search
                  ? `No conversations match "${search}"`
                  : 'Connect with clients and freelancers. Your conversations will appear here.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
