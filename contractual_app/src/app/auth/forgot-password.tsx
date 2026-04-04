import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Shield, AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../lib/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetRequest = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-8">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="flex-row items-center space-x-2 mb-8"
        >
          <ArrowLeft size={20} color="#62737a" />
          <Text className="text-text-secondary font-bold uppercase tracking-wider text-xs">Back to sign in</Text>
        </TouchableOpacity>

        <View className="items-center mb-10">
          <View className="w-16 h-16 bg-primary-light rounded-2xl items-center justify-center mb-6">
            <Mail size={32} color="#6d9c9f" />
          </View>
          <Text className="text-3xl font-bold text-text-primary text-center">Reset Password</Text>
          <Text className="text-lg text-text-secondary text-center mt-2 px-4">
            Enter your email and we'll send you a link to reset your password.
          </Text>
        </View>

        {isSuccess ? (
          <View className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl items-center">
            <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center mb-4">
              <Mail size={24} color="#059669" />
            </View>
            <Text className="text-emerald-900 font-bold text-xl mb-2 text-center">Email Sent!</Text>
            <Text className="text-emerald-700 text-center mb-6">
              Check your inbox for instructions on how to reset your password.
            </Text>
            <TouchableOpacity 
              onPress={() => router.replace('/auth/signin')}
              className="bg-emerald-600 px-8 py-3 rounded-xl"
            >
              <Text className="text-white font-bold">Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-6">
            {error && (
              <View className="flex-row items-center space-x-3 bg-red-50 p-4 rounded-xl">
                <AlertCircle size={20} color="#dc2626" />
                <Text className="text-red-600 text-sm flex-1">{error}</Text>
              </View>
            )}

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

            <TouchableOpacity 
              onPress={handleResetRequest}
              disabled={isLoading}
              className={`bg-primary py-4 rounded-2xl items-center flex-row justify-center space-x-2 mt-4 shadow-lg shadow-primary/20 ${isLoading ? 'opacity-80' : ''}`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-bold">Send Reset Link</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
