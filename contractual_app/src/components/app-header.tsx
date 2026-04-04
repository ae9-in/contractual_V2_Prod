import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
  Platform, Modal, Pressable, Dimensions, Alert
} from 'react-native';
import {
  Hexagon, Bell, User as UserIcon, Settings,
  LifeBuoy, LogOut, ChevronRight
} from 'lucide-react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function AppHeader() {
  const router = useRouter();
  const segments = useSegments();
  const { user, clearAuth } = useAuthStore();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/api/notifications?limit=1');
        setNotifications(res.data.data || []);
      } catch (err) { }
    };
    fetchUnread();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Determine if we are on the profile tab to avoid redundant navigation
  const isProfileTab = segments.includes('profile');

  const handleSignOut = async () => {
    setIsMenuVisible(false);
    await clearAuth();
    router.replace('/auth/signin' as any);
  };

  const handleNavigate = (path: string) => {
    setIsMenuVisible(false);
    router.push(path as any);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Left: Brand */}
        <TouchableOpacity
          style={styles.brand}
          onPress={() => router.push('/(freelancer)/dashboard' as any)}
          activeOpacity={0.7}
        >
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={{ width: 44, height: 44, resizeMode: 'contain' }} 
            />
          </View>
          <Text style={styles.brandText}>Contractual</Text>
        </TouchableOpacity>

        {/* Right: Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => handleNavigate('/(freelancer)/notifications')}
          >
            <Bell size={22} color="#1c2b2c" strokeWidth={2} />
            {unreadCount > 0 && <View style={styles.badge} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setIsMenuVisible(true)}
            activeOpacity={0.7}
          >
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Dropdown Menu */}
      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            {/* User Header */}
            <View style={styles.menuHeader}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail} numberOfLines={1}>{user?.email || 'user@example.com'}</Text>
            </View>

            <View style={styles.divider} />

            {/* Menu Items */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(freelancer)/profile')}
            >
              <UserIcon size={18} color="#64748b" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>View Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(freelancer)/settings')}
            >
              <Settings size={18} color="#64748b" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(freelancer)/support')}
            >
              <LifeBuoy size={18} color="#64748b" style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Support</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Sign Out */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSignOut}
            >
              <LogOut size={18} color="#ef4444" style={styles.menuIcon} />
              <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'white',
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      }
    }),
    zIndex: 1000,
  },
  container: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6d9c9f',
  },
  avatarFallbackText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 70, // Positioned below header
    right: 20,
    width: 240,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 12,
    shadowColor: '#1c2b2c',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  menuHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
});
