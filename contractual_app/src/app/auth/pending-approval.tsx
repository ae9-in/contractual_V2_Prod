import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Clock, CheckCircle2, Mail, ExternalLink, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PendingApprovalScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-8">
        <View className="items-center mt-12 mb-10">
          <View className="w-20 h-20 bg-primary-light rounded-3xl items-center justify-center mb-8 rotate-6 shadow-xl shadow-primary/10">
            <Clock size={40} color="#6d9c9f" />
          </View>
          <Text className="text-4xl font-black text-text-primary text-center">Account Under Review</Text>
          <Text className="text-xl text-text-secondary font-medium text-center mt-4 px-6 leading-relaxed">
            We're currently verifying your profile to maintain the quality of our network.
          </Text>
        </View>

        <View className="bg-slate-50 border border-slate-100 rounded-3xl p-8 space-y-6 mb-10 shadow-sm">
          <View className="flex-row items-start space-x-4">
            <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center shrink-0">
              <CheckCircle2 size={24} color="#059669" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-text-primary">Application Submitted</Text>
              <Text className="text-text-secondary leading-relaxed">Your professional details have been received and are in the queue.</Text>
            </View>
          </View>

          <View className="flex-row items-start space-x-4 opacity-50">
            <View className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center shrink-0">
              <Clock size={24} color="#62737a" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-text-primary">Verification in Progress</Text>
              <Text className="text-text-secondary leading-relaxed">Our team is reviewing your information (typically 24-48 hours).</Text>
            </View>
          </View>

          <View className="flex-row items-start space-x-4 opacity-50">
            <View className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center shrink-0">
              <Mail size={24} color="#62737a" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-text-primary">Notification Received</Text>
              <Text className="text-text-secondary leading-relaxed">You'll receive an email once your account is ready for action.</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => router.replace('/auth/signin')}
          className="bg-primary py-5 rounded-2xl items-center flex-row justify-center space-x-2 shadow-lg shadow-primary/20"
        >
          <Text className="text-white text-lg font-bold">Back to Login</Text>
          <ArrowRight size={20} color="white" />
        </TouchableOpacity>

        <View className="flex-1" />

        <TouchableOpacity className="flex-row items-center justify-center space-x-2 py-6">
          <Text className="text-primary font-bold">Visit Support Center</Text>
          <ExternalLink size={16} color="#6d9c9f" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

