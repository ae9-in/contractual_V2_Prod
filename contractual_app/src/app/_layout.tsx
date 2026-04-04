import "./globals.css"
import { Stack, useRouter, useSegments } from "expo-router"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import { View, ActivityIndicator, Platform, Text } from "react-native"
import Constants from 'expo-constants';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { UpdateModal } from "../components/UpdateModal"
import { connectSocket, disconnectSocket } from "../lib/socket"

const STARTUP_TIMEOUT_MS = 3000;

function RootLayoutNav() {
  const { initializeAuth, isAuthenticated, isLoading, user } = useAuthStore()
  const segments = useSegments()
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Connecting to server...")
  
  // Update state
  const [updateInfo, setUpdateInfo] = useState<{ 
    visible: boolean; 
    version: string; 
    update_required: boolean; 
    update_message?: string; 
    apk_url: string; 
  } | null>(null);

  const checkVersion = async () => {
    try {
      const platform = Platform.OS.toUpperCase();
      const res = await api.get(`/api/app/version/latest?platform=${platform}`);
      const latest = res.data?.data;

      if (latest && latest.version) {
        const localVersion = Constants.expoConfig?.version || '1.0.0';
        
        // Simple string comparison for now, or use semver if needed
        if (latest.version !== localVersion) {
          setUpdateInfo({
            visible: true,
            version: latest.version,
            update_required: latest.update_required,
            update_message: latest.update_message,
            apk_url: latest.apk_url,
          });
        }
      }
    } catch (e) {
      // Endpoint might be missing on production server yet
      console.warn("Version check skipped (endpoint may be missing on server):", e);
    }
  };

  useEffect(() => {
    const prepare = async () => {
      // 1. Begin background tasks (Don't await them)
      checkVersion();

      // Show "Waking up" message if hydration takes > 1s (unlikely now)
      const timeout = setTimeout(() => {
        setLoadingMessage("Checking session...")
      }, 1000);

      // Hard timeout for splash screen
      const hardTimeout = setTimeout(() => {
        setIsReady(true);
      }, STARTUP_TIMEOUT_MS);

      try {
        // 2. Local hydration (Should resolve in < 500ms)
        // This only waits for SecureStore, not the Network.
        await initializeAuth();
      } catch (e) {
        console.warn("Hydration error:", e)
      } finally {
        clearTimeout(timeout);
        clearTimeout(hardTimeout);
        setIsReady(true);
      }
    }
    prepare()
  }, [])

  useEffect(() => {
    // Socket management
    if (isAuthenticated) {
      const token = useAuthStore.getState().token;
      if (token) connectSocket(token);
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isReady || isLoading) return

    const inAuthGroup = segments[0] === "auth"

    if (!isAuthenticated && !inAuthGroup && segments[0] !== undefined && segments[0] !== "public") {
      // Allow public routes without authentication
      // router.replace("/")
    } else if (isAuthenticated) {
      const role = user?.role || 'freelancer'
      
      if (inAuthGroup || segments[0] === undefined) {
        if (role === 'business') {
          router.replace("/(business)/dashboard")
        } else {
          router.replace("/(freelancer)/dashboard")
        }
      }
    }
  }, [isAuthenticated, segments, isLoading, isReady, user])

  if (!isReady || isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', padding: 24 }}>
        <ActivityIndicator size="large" color="#6d9c9f" />
        <Text style={{ marginTop: 20, color: '#64748b', fontSize: 14, textAlign: 'center', fontWeight: '500' }}>
          {loadingMessage}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#ffffff" },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/signin" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/pending-approval" />
        <Stack.Screen name="(freelancer)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(business)" options={{ animation: 'fade' }} />
        <Stack.Screen name="public/browse" />
        <Stack.Screen name="public/gig/[id]" />
      </Stack>

      {updateInfo?.visible && (
        <UpdateModal
          visible={updateInfo.visible}
          version={updateInfo.version}
          update_required={updateInfo.update_required}
          update_message={updateInfo.update_message}
          apk_url={updateInfo.apk_url}
          onClose={() => setUpdateInfo(prev => prev ? { ...prev, visible: false } : null)}
        />
      )}
    </>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootLayoutNav />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  )
}
