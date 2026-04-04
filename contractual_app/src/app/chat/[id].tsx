import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, Image, StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, CheckCheck, Briefcase } from 'lucide-react-native';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import socket from '../../lib/socket';

interface Message {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  sender: { id: string; name: string; image: string | null };
}

function formatDateSeparator(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;
  const name = params.name as string | undefined;
  const image = params.image as string | undefined;
  const gigTitle = params.gigTitle as string | undefined;

  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [isFetching, setIsFetching] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = useCallback(async (isInitial = false) => {
    try {
      const res = await api.get(`/api/messages/${id}`);
      const fetched = res.data?.data?.messages || res.data?.messages || [];
      const reversed = [...fetched].reverse();
      setMessages(reversed);
    } catch (e) {
      console.warn("Messages fetch fail", e);
    } finally {
      if (isInitial) setIsFetching(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMessages(true);

    const handleNewMessage = (data: { conversationId: string; message: Message }) => {
      if (data.conversationId === id) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [data.message, ...prev];
        });
      }
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [fetchMessages, id]);

  const sendMessage = async () => {
    if (!text.trim() || isSending) return;
    setIsSending(true);
    const tempText = text;
    setText('');

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      content: tempText,
      type: 'TEXT',
      createdAt: new Date().toISOString(),
      sender: { id: user?.id || '', name: user?.name || '', image: user?.image || null }
    };
    setMessages(prev => [tempMsg, ...prev]);

    try {
      const res = await api.post(`/api/messages/${id}`, { content: tempText, type: 'TEXT' });
      // The API returns the new message object
      const realMsg = res.data?.data || res.data;
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? realMsg : m));
    } catch (e) {
      console.warn("Send fail", e);
      // Remove temp message on failure
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setText(tempText);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isMe = item.sender.id === user?.id;
    const prevMsg = messages[index + 1];
    const nextMsg = messages[index - 1];

    const showDateSeparator = !prevMsg || new Date(item.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
    const isFirstInGroup = !nextMsg || nextMsg.sender.id !== item.sender.id;

    return (
      <View>
        {showDateSeparator && (
          <View style={{ alignItems: 'center', marginVertical: 16 }}>
            <View style={{ backgroundColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                {formatDateSeparator(item.createdAt)}
              </Text>
            </View>
          </View>
        )}

        <View style={{
          alignSelf: isMe ? 'flex-end' : 'flex-start',
          marginBottom: isFirstInGroup ? 12 : 3,
          maxWidth: '80%',
        }}>
          <View style={{
            backgroundColor: isMe ? '#6d9c9f' : 'white',
            paddingHorizontal: 14, paddingVertical: 9,
            borderRadius: 20,
            borderBottomRightRadius: isMe ? 4 : 20,
            borderBottomLeftRadius: isMe ? 20 : 4,
            shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06, shadowRadius: 2, elevation: 1,
            borderWidth: isMe ? 0 : 1, borderColor: '#f1f5f9'
          }}>
            <Text style={{
              color: isMe ? 'white' : '#1e293b',
              fontSize: 15, lineHeight: 21, fontWeight: '500'
            }}>
              {item.content}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 3, gap: 4 }}>
              <Text style={{
                fontSize: 9,
                color: isMe ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                fontWeight: '600'
              }}>
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              {isMe && <CheckCheck size={11} color="rgba(255,255,255,0.7)" />}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
        zIndex: 10,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6, marginRight: 4 }}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>

        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#f1f5f9', overflow: 'hidden', marginRight: 12, justifyContent: 'center', alignItems: 'center' }}>
          {image && image !== 'undefined' && image !== '' ? (
            <Image source={{ uri: image }} style={{ width: 44, height: 44 }} />
          ) : (
            <View style={{ flex: 1, width: '100%', height: '100%', backgroundColor: '#6d9c9f', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: 'white' }}>
                {(name || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#0f172a' }} numberOfLines={1}>
            {name || 'Conversation'}
          </Text>
          {gigTitle && gigTitle !== '' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
              <Briefcase size={10} color="#6d9c9f" />
              <Text style={{ fontSize: 11, color: '#6d9c9f', fontWeight: '700' }} numberOfLines={1}>
                for {gigTitle}
              </Text>
            </View>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {isFetching ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#6d9c9f" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            inverted
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input area */}
        <View style={{
          backgroundColor: 'white',
          borderTopWidth: 1, borderTopColor: '#f1f5f9',
          paddingTop: 10,
          paddingHorizontal: 16,
          paddingBottom: Platform.OS === 'ios' ? 30 : 0,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}>
            <View style={{
              flex: 1,
              backgroundColor: 'transparent',
              borderRadius: 24,
              borderWidth: 1, borderColor: '#6d9c9f',
              paddingHorizontal: 16,
              justifyContent: 'center',
              minHeight: 48,
            }}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Type a message..."
                placeholderTextColor="#94a3b8"
                multiline
                style={{
                  fontSize: 15,
                  color: '#0f172a',
                  fontWeight: '500',
                  maxHeight: 100,
                  paddingVertical: 0,
                  textAlignVertical: 'center',
                }}
              />
            </View>
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!text.trim() || isSending}
              style={{
                width: 48, height: 48, borderRadius: 24,
                backgroundColor: text.trim() ? '#6d9c9f' : '#cbd5e1',
                justifyContent: 'center', alignItems: 'center',
                shadowColor: text.trim() ? '#6d9c9f' : '#cbd5e1',
                shadowOpacity: text.trim() ? 0.3 : 0, shadowRadius: 8, elevation: text.trim() ? 4 : 0,
              }}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Send size={22} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}