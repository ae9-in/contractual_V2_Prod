import React, { useState } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, TextInput, 
  StyleSheet, Dimensions, LayoutAnimation, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ChevronLeft, Search, Compass, ShieldCheck, 
  CreditCard, LifeBuoy, ChevronDown, ChevronUp, MessageCircleIcon 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const categories = [
  { icon: Compass, label: "Getting Started", count: 12, color: '#3b82f6' },
  { icon: ShieldCheck, label: "Platform Safety", count: 8, color: '#10b981' },
  { icon: CreditCard, label: "Payments", count: 15, color: '#f59e0b' },
  { icon: LifeBuoy, label: "Disputes", count: 6, color: '#ef4444' },
];

const faqs = [
  { 
    q: "How does the escrow system work?", 
    a: "When a contract begins, the business deposits the full project amount into our secure digital escrow. Funds are only released to the freelancer once the business approves the project submission, or after a specific milestone is met." 
  },
  { 
    q: "What is the fee structure?", 
    a: "Contractual charges a flat 10% platform service fee on successful project completions to cover escrow management, moderation, and technical support. There are no hidden subscription fees." 
  },
  { 
    q: "How do I dispute a project submission?", 
    a: "If a submission doesn't meet the agreed criteria, you can click 'Raise Dispute' on the contract page. Our admin team will investigate the contract requirements and submission history to reach a fair resolution." 
  }
];

function FAQItem({ q, a }: { q: string, a: string }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity 
      style={styles.faqCard} 
      onPress={toggle} 
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{q}</Text>
        {expanded ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
      </View>
      {expanded && (
        <Text style={styles.faqAnswer}>{a}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function SupportScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        {/* Hero Section with Custom Header */}
        <View>
          <LinearGradient
            colors={['#0f172a', '#1e293b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <SafeAreaView edges={['top']}>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Support</Text>
                <View style={{ width: 40 }} />
              </View>
            </SafeAreaView>

            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Support & Resources</Text>
              <Text style={styles.heroSub}>Clear documentation to help you build and secure projects.</Text>
              
              <View style={styles.searchContainer}>
                <Search size={18} color="rgba(255,255,255,0.3)" style={styles.searchIcon} />
                <TextInput 
                  placeholder="Search help articles..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={styles.searchInput}
                />
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          {/* Categories Grid */}
          <View style={styles.categoriesGrid}>
            {categories.map((c) => (
              <TouchableOpacity key={c.label} style={styles.categoryCard}>
                <View style={[styles.iconBox, { backgroundColor: `${c.color}15` }]}>
                  <c.icon size={22} color={c.color} />
                </View>
                <Text style={styles.categoryLabel}>{c.label}</Text>
                <Text style={styles.categoryCount}>{c.count} ARTICLES</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* FAQs Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          </View>

          <View style={styles.faqList}>
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </View>

          {/* Contact Card */}
          <View style={styles.contactCard}>
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.contactGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.contactIconBox}>
                <MessageCircleIcon size={24} color="white" />
              </View>
              <View style={styles.contactTextContent}>
                <Text style={styles.contactTitle}>Can't find what you're looking for?</Text>
                <Text style={styles.contactSub}>Our specialists are online waiting to assist you.</Text>
                <TouchableOpacity style={styles.contactButton}>
                  <Text style={styles.contactButtonText}>Open Support Ticket</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  hero: {
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: 'white',
  },
  heroContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
    letterSpacing: -1,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    marginTop: 24,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    padding: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
  },
  categoryCard: {
    width: (Dimensions.get('window').width - 60) / 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: 'white',
  },
  categoryCount: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.3)',
    marginTop: 4,
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionLine: {
    width: 4,
    height: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: 'white',
  },
  faqList: {
    gap: 12,
    marginBottom: 40,
  },
  faqCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: 'white',
    marginRight: 10,
    textTransform: 'uppercase',
    letterSpacing: -0.2,
  },
  faqAnswer: {
    marginTop: 12,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    lineHeight: 20,
  },
  contactCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  contactGradient: {
    padding: 24,
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  contactIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  contactTextContent: {
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
  },
  contactSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  contactButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButtonText: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '900',
  },
});
