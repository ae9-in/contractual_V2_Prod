import React from 'react';
import { Platform, View } from 'react-native';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Search, Briefcase, MessageSquare, User } from 'lucide-react-native';
import AppHeader from '../../components/app-header';

export default function FreelancerLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6d9c9f',
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: 'white',
          height: Platform.OS === 'ios' ? 85 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          shadowColor: '#1c2b2c',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 20,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.3,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          headerShown: true,
          header: () => <AppHeader />,
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? 'rgba(109,156,159,0.12)' : 'transparent',
              borderRadius: 12, padding: 6,
            }}>
              <LayoutDashboard size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="contracts"
        options={{
          title: 'Contracts',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? 'rgba(109,156,159,0.12)' : 'transparent',
              borderRadius: 12, padding: 6,
            }}>
              <Briefcase size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="browse-gigs"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? '#6d9c9f' : 'rgba(109,156,159,0.1)',
              borderRadius: 16, padding: 8,
              shadowColor: focused ? '#6d9c9f' : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3, shadowRadius: 8, elevation: focused ? 6 : 0,
            }}>
              <Search size={22} color={focused ? 'white' : '#6d9c9f'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? 'rgba(109,156,159,0.12)' : 'transparent',
              borderRadius: 12, padding: 6,
            }}>
              <MessageSquare size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? 'rgba(109,156,159,0.12)' : 'transparent',
              borderRadius: 12, padding: 6,
            }}>
              <User size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* Hidden screens */}
      <Tabs.Screen name="earnings" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="support" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="notifications" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
