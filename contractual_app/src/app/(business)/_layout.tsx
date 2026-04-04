import React from 'react';
import { View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { LayoutDashboard, PlusCircle, Briefcase, MessageSquare, User } from 'lucide-react-native';

export default function BusinessLayout() {
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
          shadowColor: '#6d9c9f',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
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
        name="my-gigs"
        options={{
          title: 'My Gigs',
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
        name="post-gig"
        options={{
          title: 'Post',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? '#6d9c9f' : 'rgba(109,156,159,0.1)',
              borderRadius: 16, padding: 8,
              shadowColor: focused ? '#6d9c9f' : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3, shadowRadius: 8, elevation: focused ? 6 : 0,
            }}>
              <PlusCircle size={22} color={focused ? 'white' : '#6d9c9f'} />
            </View>
          ),
          tabBarActiveTintColor: '#6d9c9f',
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

      {/* Hidden screens — accessible via navigation but not shown in tab bar */}
      <Tabs.Screen name="billing"        options={{ href: null }} />
      <Tabs.Screen name="applications"   options={{ href: null }} />
      <Tabs.Screen name="contracts"      options={{ href: null }} />
      <Tabs.Screen name="notifications"  options={{ href: null }} />
      <Tabs.Screen name="reviews"        options={{ href: null }} />
      <Tabs.Screen name="settings"       options={{ href: null }} />
    </Tabs>
  );
}
