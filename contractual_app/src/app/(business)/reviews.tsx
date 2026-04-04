import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Star, ChevronLeft, MessageSquare, Briefcase } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../lib/api';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    name: string;
    image: string | null;
  };
  gig?: {
    title: string;
  };
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} color="#f59e0b" fill={i <= rating ? '#f59e0b' : 'none'} />
      ))}
    </View>
  );
}

function ReviewCard({ item }: { item: Review }) {
  const initials = item.reviewer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const date = new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <View style={{
      backgroundColor: 'white', borderRadius: 22, padding: 20, marginBottom: 14,
      shadowColor: '#6d9c9f', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
    }}>
      {/* Reviewer */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <LinearGradient colors={['#6d9c9f', '#2d7a7e']} style={{
          width: 46, height: 46, borderRadius: 14,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>{initials}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#1c2b2c' }}>
            {item.reviewer.name}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600', marginTop: 1 }}>{date}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <StarRow rating={item.rating} size={14} />
          <Text style={{ color: '#f59e0b', fontWeight: '800', fontSize: 13 }}>
            {item.rating.toFixed(1)}
          </Text>
        </View>
      </View>

      {/* Gig */}
      {item.gig && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6,
          backgroundColor: '#f0f9fa', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 12 }}>
          <Briefcase size={12} color="#6d9c9f" />
          <Text style={{ color: '#2d7a7e', fontSize: 12, fontWeight: '700' }} numberOfLines={1}>
            {item.gig.title}
          </Text>
        </View>
      )}

      {/* Comment */}
      {item.comment ? (
        <Text style={{ color: '#475569', fontSize: 14, lineHeight: 22 }}>
          "{item.comment}"
        </Text>
      ) : (
        <Text style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>No written review.</Text>
      )}
    </View>
  );
}

export default function BusinessReviews() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await api.get('/api/business/reviews');
      setReviews(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Reviews fetch error:', err);
      setReviews([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchReviews(); };

  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
    pct: reviews.length > 0
      ? Math.round((reviews.filter(r => Math.round(r.rating) === star).length / reviews.length) * 100)
      : 0,
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafa' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6d9c9f" />}
      >
        {/* Header */}
        <LinearGradient
          colors={['#6d9c9f', '#2d7a7e']}
          style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 8 }}
            >
              <ChevronLeft size={20} color="white" />
            </TouchableOpacity>
            <Text style={{ fontSize: 22, fontWeight: '900', color: 'white', letterSpacing: -0.5 }}>
              Reviews
            </Text>
          </View>

          {/* Rating summary */}
          {reviews.length > 0 && (
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 18,
              flexDirection: 'row', alignItems: 'center', gap: 20,
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 48, fontWeight: '900', lineHeight: 52 }}>
                  {avgRating.toFixed(1)}
                </Text>
                <StarRow rating={Math.round(avgRating)} size={16} />
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginTop: 4 }}>
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 5 }}>
                {distribution.map(d => (
                  <View key={d.star} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', width: 8 }}>
                      {d.star}
                    </Text>
                    <Star size={10} color="#f59e0b" fill="#f59e0b" />
                    <View style={{ flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3 }}>
                      <View style={{ width: `${d.pct}%`, height: 6, backgroundColor: '#f59e0b', borderRadius: 3 }} />
                    </View>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, width: 24, textAlign: 'right' }}>
                      {d.count}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, marginTop: -14 }}>
          {isLoading ? (
            <ActivityIndicator color="#6d9c9f" style={{ marginTop: 20 }} />
          ) : reviews.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <View style={{ backgroundColor: '#f0f9fa', borderRadius: 30, padding: 24, marginBottom: 20 }}>
                <MessageSquare size={44} color="#6d9c9f" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#1c2b2c', marginBottom: 8 }}>
                No Reviews Yet
              </Text>
              <Text style={{ color: '#62737a', textAlign: 'center', lineHeight: 22, fontSize: 14 }}>
                Reviews from freelancers will appear here after completing contracts.
              </Text>
            </View>
          ) : (
            reviews.map(r => <ReviewCard key={r.id} item={r} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
