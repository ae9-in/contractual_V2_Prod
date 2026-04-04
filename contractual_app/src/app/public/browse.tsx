import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Filter, ChevronRight, Star, Clock, DollarSign } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../lib/api';

interface Gig {
  id: string;
  title: string;
  category: string;
  budgetAmount: number;
  minBudget: number | null;
  maxBudget: number | null;
  bannerImage?: string | null;
  business: {
    name: string;
    companyName: string | null;
    image: string | null;
  };
}

export default function BrowseScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGigs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/gigs', {
        params: {
          search: search,
          limit: 20
        }
      });
      setGigs(response.data.data || []);
      setError(null);
    } catch (err: any) {
      setError('Failed to load gigs');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  const renderGigItem = ({ item }: { item: Gig }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/public/gig/${item.id}`)}
      className="bg-white border border-slate-100 rounded-3xl p-4 mb-4 shadow-sm"
    >
      <View className="flex-row space-x-4">
        {/* Business Logo Placeholder or Image */}
        <View className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden">
          {item.business.image ? (
            <Image source={{ uri: item.business.image }} className="w-full h-full" />
          ) : (
            <View className="w-full h-full items-center justify-center bg-primary-light">
              <Text className="text-primary font-bold text-xl">
                {(item.business.companyName || item.business.name || 'B').charAt(0)}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1 justify-center">
          <Text className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{item.category}</Text>
          <Text className="text-lg font-bold text-text-primary mb-1" numberOfLines={1}>{item.title}</Text>
          <Text className="text-sm text-text-secondary" numberOfLines={1}>
            {item.business.companyName || item.business.name}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-slate-50">
        <View className="flex-row items-center space-x-1">
          <DollarSign size={16} color="#6d9c9f" />
          <Text className="text-lg font-black text-text-primary">
            ₹{item.budgetAmount || `${item.minBudget} - ${item.maxBudget}`}
          </Text>
        </View>
        <View className="bg-slate-100 px-3 py-1 rounded-full">
           <Text className="text-xs font-bold text-text-secondary uppercase">Active</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View className="px-6 pt-4 pb-2">
        <Text className="text-3xl font-black text-text-primary mb-4">Browse Gigs</Text>
        
        {/* Search Bar */}
        <View className="flex-row items-center space-x-3 mb-4">
          <View className="flex-1 flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
            <Search size={20} color="#62737a" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search talent or gigs..."
              className="flex-1 ml-3 text-text-primary font-medium"
              onSubmitEditing={fetchGigs}
            />
          </View>
          <TouchableOpacity className="w-12 h-12 bg-primary rounded-2xl items-center justify-center shadow-lg shadow-primary/20">
            <Filter size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6d9c9f" />
          <Text className="mt-4 text-text-secondary font-medium tracking-wide italic">Fetching latest gigs...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-10">
          <Text className="text-red-500 font-bold text-center mb-4">{error}</Text>
          <TouchableOpacity onPress={fetchGigs} className="bg-primary px-6 py-2 rounded-xl">
            <Text className="text-white font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={gigs}
          renderItem={renderGigItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="mt-20 items-center justify-center">
              <Text className="text-text-secondary text-lg italic">No gigs found matching your search.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

