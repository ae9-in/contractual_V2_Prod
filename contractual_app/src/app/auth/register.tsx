import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Building2, Briefcase, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

type AccountType = 'business' | 'freelancer' | null;

export default function RegisterScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name || !email || !password || !accountType) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password,
        role: accountType.toUpperCase(),
      });
      const responseData = response?.data?.data ?? response?.data;
      const token = response?.data?.token;
      const user = responseData?.user ?? responseData;

      // Some roles might require approval
      if (responseData?.pendingApproval || user?.approvalStatus === 'PENDING' || user?.status === 'PENDING') {
        router.push('/auth/pending-approval');
      } else {
        if (token && user) {
          await setAuth(token, user);
        }
        // Root layout handles role-based redirect when auth state changes
        router.replace('/auth/signin');
      }
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message || err?.response?.data?.error;
      const timeoutMessage =
        err?.code === "ECONNABORTED" ? "Server timeout. Please try again in a few seconds." : null;
      setError(timeoutMessage || serverMessage || err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!accountType) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View className="px-6 py-8 flex-1 justify-center">
          <View className="items-center mb-12">
            <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-4 transform -rotate-6 shadow-lg shadow-primary/20">
              <Shield size={32} color="white" />
            </View>
            <Text className="text-3xl font-bold text-text-primary">Join Contractual</Text>
            <Text className="text-lg text-text-secondary mt-2">Choose your path to get started</Text>
          </View>

          <View className="space-y-4">
            <TouchableOpacity
              onPress={() => setAccountType('business')}
              className="p-6 rounded-3xl border-2 border-slate-100 bg-slate-50 flex-row items-center space-x-4"
            >
              <View className="w-12 h-12 rounded-xl bg-primary-light items-center justify-center">
                <Building2 size={24} color="#6d9c9f" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-text-primary">I'm a Business</Text>
                <Text className="text-text-secondary">Post gigs and hire talent</Text>
              </View>
              <ArrowRight size={20} color="#62737a" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setAccountType('freelancer')}
              className="p-6 rounded-3xl border-2 border-slate-100 bg-slate-50 flex-row items-center space-x-4"
            >
              <View className="w-12 h-12 rounded-xl bg-primary-light items-center justify-center">
                <Briefcase size={24} color="#6d9c9f" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-text-primary">I'm a Freelancer</Text>
                <Text className="text-text-secondary">Find work and earn ₹</Text>
              </View>
              <ArrowRight size={20} color="#62737a" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-12 items-center"
          >
            <Text className="text-text-secondary font-medium">Already have an account? <Text className="text-primary font-bold">Sign In</Text></Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-8">
        <TouchableOpacity
          onPress={() => setAccountType(null)}
          className="flex-row items-center space-x-2 mb-8"
        >
          <ArrowLeft size={20} color="#62737a" />
          <Text className="text-text-secondary font-bold uppercase tracking-wider text-xs">Back to selection</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-text-primary mb-2">Create Account</Text>
        <Text className="text-lg text-text-secondary mb-8">
          Registering as a <Text className="text-primary font-bold">{accountType.charAt(0).toUpperCase() + accountType.slice(1)}</Text>
        </Text>

        {error && (
          <View className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        <View className="space-y-6">
          <View>
            <Text className="text-sm font-bold text-text-primary mb-2 ml-1">Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              className="w-full bg-white border border-border px-4 py-4 rounded-2xl text-text-primary"
            />
          </View>

          <View>
            <Text className="text-sm font-bold text-text-primary mb-2 ml-1">Email Address</Text>
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
                placeholder="Create a strong password"
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

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            className={`bg-primary py-4 rounded-2xl items-center flex-row justify-center space-x-2 mt-4 shadow-lg shadow-primary/20 ${isLoading ? 'opacity-80' : ''}`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text className="text-center text-text-secondary text-sm mt-8 px-4 leading-relaxed">
          By joining, you agree to our <Text className="text-primary font-bold">Terms of Service</Text> and <Text className="text-primary font-bold">Privacy Policy</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
