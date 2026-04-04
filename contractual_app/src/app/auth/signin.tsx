import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Shield, Eye, EyeOff, Building2, UserCircle, Loader2, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

export default function SignInScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [accountType, setAccountType] = useState<'business' | 'freelancer'>('business');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/app-mobile-login', {
        email,
        password,
        role: accountType,
      });

      const token = response?.data?.token;
      const user = response?.data?.user;
      if (!token || !user) {
        throw new Error(response?.data?.message || 'Invalid login response from server');
      }

      // Use the store to handle authentication
      await setAuth(token, user);
    } catch (err: any) {
      console.error("Login Error:", err);
      const status = err?.response?.status;
      const data = err?.response?.data;
      
      let errorMessage = "Failed to sign in. Please check your internet connection.";

      if (err?.code === "ERR_NETWORK" || err?.message === "Network Error") {
        errorMessage = "Network error. The live server may be down or unreachable. Please check your connection.";
      } else if (status === 401) {
        errorMessage = data?.message || data?.error || "Invalid email or password.";
      } else if (status === 404) {
        errorMessage = "Login service not found. The server may be updating.";
      } else if (status >= 500) {
        errorMessage = "Server error. The live backend is currently experiencing issues.";
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-8">
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2 mb-8">
          <View className="w-10 h-10 bg-primary rounded-xl items-center justify-center">
            <Shield size={24} color="white" />
          </View>
          <Text className="text-2xl font-bold text-text-primary tracking-tight">
            Contractual
          </Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-text-primary mb-2">Welcome back</Text>
        <Text className="text-lg text-text-secondary mb-8">Sign in to your Contractual account</Text>

        {/* Account Type Toggle */}
        <View className="flex-row bg-slate-100 p-1 rounded-2xl mb-8">
          <TouchableOpacity
            onPress={() => setAccountType('business')}
            style={[
              { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
              accountType === 'business' ? { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } : {}
            ]}
          >
            <Building2 size={20} color={accountType === 'business' ? '#1c2b2c' : '#62737a'} />
            <Text style={{ fontWeight: 'bold', color: accountType === 'business' ? '#1c2b2c' : '#62737a' }}>
              Business
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAccountType('freelancer')}
            style={[
              { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
              accountType === 'freelancer' ? { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } : {}
            ]}
          >
            <UserCircle size={20} color={accountType === 'freelancer' ? '#1c2b2c' : '#62737a'} />
            <Text style={{ fontWeight: 'bold', color: accountType === 'freelancer' ? '#1c2b2c' : '#62737a' }}>
              Freelancer
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        {/* Form */}
        <View className="space-y-6">
          <View>
            <Text className="text-sm font-bold text-text-primary mb-2 ml-1">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="w-full bg-white border border-border px-4 py-4 rounded-2xl text-text-primary"
            />
          </View>

          <View>
            <Text className="text-sm font-bold text-text-primary mb-2 ml-1">Password</Text>
            <View className="relative">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                className="w-full bg-white border border-border px-4 py-4 rounded-2xl text-text-primary"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -mt-3"
              >
                {showPassword ? <EyeOff size={24} color="#62737a" /> : <Eye size={24} color="#62737a" />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push('/auth/forgot-password')} className="self-end">
            <Text className="text-primary font-bold">Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignIn}
            disabled={isLoading}
            style={[
              { backgroundColor: '#6d9c9f', paddingVertical: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 16, shadowColor: '#6d9c9f', shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
              isLoading ? { opacity: 0.8 } : {}
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-1" />

        <View className="flex-row justify-center mt-12">
          <Text className="text-text-secondary">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push(`/auth/register?role=${accountType}` as any)}>
            <Text className="text-primary font-bold text-lg">Join Free →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
