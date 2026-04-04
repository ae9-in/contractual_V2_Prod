import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, Animated, TouchableOpacity, TextInput,
  ActivityIndicator, Image, RefreshControl,
  Dimensions, ScrollView, Modal, Alert, KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Search, Filter, IndianRupee, Briefcase, ChevronRight,
  Clock, Zap, X, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../lib/api';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 160; // Increased to accommodate title at top

interface Gig {
  id: string;
  title: string;
  budgetAmount: number;
  minBudget: number | null;
  maxBudget: number | null;
  currency: string;
  deadline: string | null;
  business: {
    id: string;
    name: string;
    image: string | null;
    isVerified?: boolean;
    companyName: string | null;
  };
  requiredSkills: { id: string; name: string }[];
  _count: { applications: number };
  userApplication: { id: string; status: string; contract?: any } | null;
}

type FilterId = 'all' | 'open' | 'applied' | 'closing';
const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'applied', label: 'Applied' },
  { id: 'closing', label: 'Closing Soon' },
];

const CATEGORIES = ['All', 'Development', 'Design', 'Marketing', 'Writing', 'Management', 'Legal'];

function AppStatusRow({ status }: { status: string }) {
  if (status === 'PENDING') {
    return (
      <View style={styles.statusRow}>
        <CheckCircle2 size={14} color="#22c55e" strokeWidth={2.5} />
        <Text style={styles.statusTextPending}>Applied: Pending</Text>
      </View>
    );
  }
  if (status === 'ACCEPTED') {
    return (
      <View style={[styles.statusRow, styles.statusRowAccepted]}>
        <CheckCircle2 size={14} color="#22c55e" strokeWidth={2.5} />
        <Text style={styles.statusTextAccepted}>Applied: Accepted</Text>
      </View>
    );
  }
  return (
    <View style={[styles.statusRow, styles.statusRowRejected]}>
      <XCircle size={14} color="#ef4444" strokeWidth={2.5} />
      <Text style={styles.statusTextRejected}>Applied: Rejected</Text>
    </View>
  );
}

function GigCard({ item, onApply, onDetails }: { item: Gig; onApply: () => void; onDetails: () => void }) {
  const company = item.business.companyName || item.business.name;
  const deadlineDate = item.deadline ? new Date(item.deadline) : null;
  const expiryLabel = deadlineDate ? deadlineDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible';
  
  return (
    <View style={styles.gigCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.gigTitle}>{item.title}</Text>
        <View style={styles.openBadge}>
          <Text style={styles.openBadgeText}>OPEN</Text>
        </View>
      </View>

      <View style={styles.postedBy}>
        <Clock size={13} color="#94a3b8" />
        <Text style={styles.postedLabel}>Posted by </Text>
        <Text style={styles.companyName} numberOfLines={1}>{company}</Text>
        {item.business.isVerified && (
          <Text style={styles.verifiedText}>✓ Verified</Text>
        )}
      </View>

      <View style={styles.infoBoxContainer}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Budget</Text>
          <Text style={styles.budgetText}>
            {item.minBudget && item.maxBudget && item.minBudget !== item.maxBudget 
              ? `₹${item.minBudget.toLocaleString()} - ₹${item.maxBudget.toLocaleString()}`
              : `₹${(item.minBudget || item.budgetAmount || 500).toLocaleString()}`}
          </Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Deadline</Text>
          <Text style={styles.deadlineText}>{expiryLabel}</Text>
        </View>
      </View>

      <View style={styles.skillsRow}>
        {item.requiredSkills.slice(0, 3).map(s => (
          <View key={s.id} style={styles.skillBadge}>
            <Text style={styles.skillText}>{s.name}</Text>
          </View>
        ))}
        {item.requiredSkills.length > 3 && (
          <View style={{ paddingVertical: 6 }}>
            <Text style={styles.moreSkillsText}>+{item.requiredSkills.length - 3}</Text>
          </View>
        )}
      </View>

      {item.userApplication && (
        <View style={{ marginBottom: 16 }}>
          <AppStatusRow status={item.userApplication.status} />
        </View>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity onPress={onDetails}>
          <Text style={styles.detailsText}>Details →</Text>
        </TouchableOpacity>
        
        {!item.userApplication ? (
          <TouchableOpacity onPress={onApply}>
            <LinearGradient 
              colors={['#6d9c9f', '#2d7a7e']} 
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.applyButton}
            >
              <Text style={styles.applyButtonText}>Instant Apply</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.submittedRow}>
             <CheckCircle2 size={16} color="#6d9c9f" strokeWidth={3} />
             <Text style={styles.submittedText}>Submitted</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function FreelancerBrowseGigs() {
  const router = useRouter();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [applyGig, setApplyGig] = useState<Gig | null>(null);
  const [bid, setBid] = useState('');
  const [cover, setCover] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Animation logic for collapsible header
  const scrollY = useRef(new Animated.Value(0)).current;
  const TOTAL_HEADER_GAP = HEADER_HEIGHT + 35; // Height + its top positioning
  const diffClamp = Animated.diffClamp(scrollY, 0, TOTAL_HEADER_GAP);
  const translateY = diffClamp.interpolate({
    inputRange: [0, TOTAL_HEADER_GAP],
    outputRange: [0, -TOTAL_HEADER_GAP - 20], // Translate fully out including safe area
  });

  const fetchGigs = useCallback(async () => {
    try {
      const response = await api.get('/api/gigs', { params: { limit: 100 } });
      setGigs(response.data?.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchGigs(); }, []);

  const visibleGigs = useMemo(() => {
    return gigs.filter(g => {
      const matchesSearch = !search.trim() || g.title.toLowerCase().includes(search.trim().toLowerCase());
      if (!matchesSearch) return false;

      if (filter === 'open') return !g.userApplication;
      if (filter === 'applied') return !!g.userApplication;
      if (filter === 'closing') {
        if (!g.deadline) return false;
        const d = new Date(g.deadline);
        const diff = (d.getTime() - Date.now()) / (1000 * 3600 * 24);
        return diff >= 0 && diff <= 7;
      }
      return true;
    });
  }, [gigs, filter, search, selectedCategory]);

  const onApply = async () => {
    if (!applyGig) return;
    const bidNum = parseInt(bid);
    if (!bidNum || bidNum <= 0) return Alert.alert('Error', 'Enter a valid bid amount');
    if (cover.trim().length < 100) return Alert.alert('Error', 'Cover letter must be at least 100 characters');

    setSubmitting(true);
    try {
      await api.post('/api/applications', {
        gigId: applyGig.id,
        proposedPrice: bidNum,
        proposal: cover.trim(),
      });
      Alert.alert('Success', 'Proposal submitted successfully!');
      setApplyGig(null);
      setBid('');
      setCover('');
      fetchGigs();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Floating Collapsible Header */}
      <Animated.View style={[styles.floatingHeader, { transform: [{ translateY }] }]}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Browse Gigs</Text>
          <Text style={styles.resultCount}>
            {isLoading ? '...' : `${visibleGigs.length} opportunities available`}
          </Text>
        </View>

         {/* Search & Filter Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color="#94a3b8" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search projects..."
              placeholderTextColor="#cbd5e1"
              value={search}
              onChangeText={setSearch}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')}><X size={16} color="#94a3b8" /></TouchableOpacity>
            ) : (
               <Filter size={18} color="#94a3b8" />
            )}
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filtersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {FILTERS.map(f => (
              <TouchableOpacity 
                key={f.id} 
                onPress={() => setFilter(f.id)}
                style={[styles.filterPill, filter === f.id && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, filter === f.id && styles.filterPillTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.filterDivider} />
            {CATEGORIES.filter(c => c !== 'All').map(c => (
              <TouchableOpacity 
                key={c} 
                onPress={() => setSelectedCategory(c === selectedCategory ? 'All' : c)}
                style={[styles.categoryPill, selectedCategory === c && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, selectedCategory === c && styles.filterPillTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>

      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#6d9c9f" /></View>
      ) : (
        <Animated.FlatList
          data={visibleGigs}
          keyExtractor={item => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchGigs(); }} />}
          renderItem={({ item }) => (
            <GigCard 
              item={item} 
              onApply={() => { setApplyGig(item); setBid(String(Math.round(item.budgetAmount))); }}
              onDetails={() => router.push(`/public/gig/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                 <AlertCircle size={40} color="#94a3b8" />
              </View>
              <Text style={styles.emptyTitle}>No Gigs Found</Text>
              <Text style={styles.emptySub}>Try adjusting your search or filters.</Text>
            </View>
          }
        />
      )}

      {/* Apply Modal */}
      <Modal visible={!!applyGig} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
           <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Instant Apply</Text>
                <TouchableOpacity onPress={() => setApplyGig(null)}><X size={24} color="#94a3b8" /></TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.modalGigTitle}>{applyGig?.title}</Text>
                <Text style={styles.modalGigCompany}>by {applyGig?.business.companyName || applyGig?.business.name}</Text>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>YOUR BID (₹)</Text>
                  <TextInput 
                    style={styles.modalInput}
                    value={bid}
                    onChangeText={setBid}
                    keyboardType="numeric"
                    placeholder="e.g. 5000"
                  />
                </View>

                <View style={styles.modalInputGroup}>
                  <View style={styles.modalLabelRow}>
                    <Text style={styles.modalLabel}>COVER LETTER</Text>
                    <Text style={[styles.charCount, cover.trim().length < 100 ? { color: '#ef4444' } : { color: '#22c55e' }]}>
                      {cover.trim().length}/100+
                    </Text>
                  </View>
                  <TextInput 
                    style={styles.modalTextArea}
                    value={cover}
                    onChangeText={setCover}
                    multiline
                    placeholder="Explain why you're a perfect fit for this project..."
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <TouchableOpacity 
                   disabled={submitting || cover.trim().length < 100}
                   onPress={onApply}
                   style={{ opacity: (submitting || cover.trim().length < 100) ? 0.6 : 1 }}
                >
                  <LinearGradient 
                    colors={['#6d9c9f', '#2d7a7e']} 
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.modalSubmitBtn}
                  >
                    {submitting ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.modalSubmitText}>Submit Proposal</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setApplyGig(null)} style={styles.modalCancelBtn}>
                   <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
           </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  floatingHeader: {
    position: 'absolute',
    top: 25, // More space for title below status bar
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#f6f8fa',
    paddingBottom: 4,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  resultCount: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#1c2b2c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  filtersSection: {
    backgroundColor: 'transparent',
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 4,
  },
  filterPill: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryPill: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterPillActive: {
    backgroundColor: '#6d9c9f',
    borderColor: '#6d9c9f',
  },
  filterPillText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '800',
  },
  filterPillTextActive: {
    color: 'white',
  },
  filterDivider: {
    width: 1,
    backgroundColor: '#cbd5e1',
    height: 20,
    marginHorizontal: 5,
    alignSelf: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: HEADER_HEIGHT + 45, // Adjusted for the extra top margin
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusRowAccepted: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  statusRowRejected: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  statusTextPending: {
    fontSize: 13,
    fontWeight: '800',
    color: '#22c55e',
  },
  statusTextAccepted: {
    fontSize: 13,
    fontWeight: '800',
    color: '#22c55e',
  },
  statusTextRejected: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ef4444',
  },
  gigCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#1c2b2c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  gigTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0f172a',
    flex: 1,
    lineHeight: 24,
  },
  openBadge: {
    backgroundColor: 'rgba(109,156,159,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  openBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6d9c9f',
  },
  postedBy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  postedLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  companyName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#22c55e',
    marginLeft: 2,
  },
  infoBoxContainer: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoBox: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  budgetText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#22c55e',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  deadlineText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  skillBadge: {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillText: {
    color: '#6d9c9f',
    fontSize: 12,
    fontWeight: '700',
  },
  moreSkillsText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  detailsText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  applyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 14,
  },
  submittedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submittedText: {
    color: '#6d9c9f',
    fontWeight: '900',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIconContainer: {
    backgroundColor: '#f1f5f9',
    padding: 20,
    borderRadius: 30,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
  },
  emptySub: {
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 40,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  modalGigTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 4,
  },
  modalGigCompany: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 20,
  },
  modalInputGroup: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    color: '#0f172a',
  },
  modalLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 11,
    fontWeight: '800',
  },
  modalTextArea: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    color: '#0f172a',
    minHeight: 160,
    textAlignVertical: 'top',
  },
  modalSubmitBtn: {
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
  },
  modalSubmitText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
  },
  modalCancelBtn: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#64748b',
    fontWeight: '800',
  },
});
