import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image, ScrollView,
  TextInput, ImageBackground, StatusBar, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Shield, Search, Zap, Star, Users, TrendingUp,
  ArrowRight, CheckCircle2, Briefcase, Globe,
  ChevronRight, Lock, Sparkles,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Config ───────────────────────────────────────────────────────────────────
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1600&h=900&fit=crop&q=80';

const { width } = Dimensions.get('window');

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  // Base
  bg: '#0d1617',
  surface: '#141f20',
  surfaceUp: '#1a2829',
  // Brand
  teal: '#6d9c9f',
  tealLight: '#a8d8db',
  tealDim: 'rgba(109,156,159,0.12)',
  tealBorder: 'rgba(109,156,159,0.22)',
  // Accent
  gold: '#f0c96a',
  goldDim: 'rgba(240,201,106,0.12)',
  // Text
  textPrimary: '#f0f4f4',
  textSecondary: 'rgba(240,244,244,0.55)',
  textMuted: 'rgba(240,244,244,0.28)',
  // Borders
  borderFaint: 'rgba(255,255,255,0.07)',
  borderMid: 'rgba(255,255,255,0.12)',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Thin horizontal promo bar at very top */
function PromoStrip({ onPress }: { onPress: () => void }) {
  return (
    <View style={{
      backgroundColor: C.tealDim,
      borderBottomWidth: 1,
      borderBottomColor: C.tealBorder,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 10,
    }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 12 }}>
        <Zap size={12} color={C.tealLight} />
        <Text style={{
          fontSize: 11, fontWeight: '600', color: C.textSecondary, lineHeight: 15,
        }}>
          <Text style={{ color: C.tealLight, fontWeight: '700' }}>Business Plus</Text>
          {' '}— Hire verified talent with escrow-ready workflows.
        </Text>
      </View>
      <TouchableOpacity
        onPress={onPress}
        style={{
          backgroundColor: C.gold,
          paddingHorizontal: 12, paddingVertical: 6,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#1c2b2c', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 }}>
          GET STARTED
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/** Mode toggle pill: "Find talent" / "Browse jobs" */
function SearchToggle({
  mode, onChange,
}: { mode: 'talent' | 'jobs'; onChange: (m: 'talent' | 'jobs') => void }) {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: 'rgba(255,255,255,0.06)',
      borderRadius: 100,
      padding: 3,
      borderWidth: 1,
      borderColor: C.borderFaint,
      alignSelf: 'flex-start',
    }}>
      {(['talent', 'jobs'] as const).map(m => {
        const active = mode === m;
        return (
          <TouchableOpacity
            key={m}
            onPress={() => onChange(m)}
            style={{
              paddingHorizontal: 16, paddingVertical: 7,
              borderRadius: 100,
              backgroundColor: active ? C.teal : 'transparent',
            }}
          >
            <Text style={{
              fontSize: 11, fontWeight: '700',
              color: active ? '#fff' : C.textSecondary,
              letterSpacing: 0.2,
            }}>
              {m === 'talent' ? 'Find talent' : 'Browse jobs'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** Stat pill shown in hero */
function HeroStatPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: 'rgba(255,255,255,0.93)',
      alignSelf: 'flex-start',
      paddingHorizontal: 14, paddingVertical: 9,
      borderRadius: 16,
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18, shadowRadius: 10, elevation: 6,
    }}>
      {icon}
      <Text style={{ fontSize: 12, fontWeight: '700', color: '#1c2b2c' }}>{label}</Text>
    </View>
  );
}

/** Floating glass search card */
function SearchDock({
  mode, onModeChange, query, onQueryChange, onSearch,
}: {
  mode: 'talent' | 'jobs';
  onModeChange: (m: 'talent' | 'jobs') => void;
  query: string;
  onQueryChange: (q: string) => void;
  onSearch: () => void;
}) {
  return (
    <View style={{
      backgroundColor: C.surface,
      borderWidth: 1, borderColor: C.borderMid,
      borderRadius: 28, padding: 22,
      shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.35, shadowRadius: 28, elevation: 20,
    }}>
      {/* Label + toggle */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Text style={{
          fontSize: 10, fontWeight: '700', color: C.textMuted,
          textTransform: 'uppercase', letterSpacing: 1,
        }}>I want to</Text>
        <SearchToggle mode={mode} onChange={onModeChange} />
      </View>

      {/* Search input */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16, marginBottom: 14,
        paddingHorizontal: 14, paddingVertical: 2,
      }}>
        <Search size={18} color="#94a3b8" style={{ marginRight: 10 }} />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          onSubmitEditing={onSearch}
          placeholder={
            mode === 'talent'
              ? 'Search by role, skills, keywords…'
              : 'Search jobs, categories, clients…'
          }
          placeholderTextColor="#94a3b8"
          style={{
            flex: 1, fontSize: 14, fontWeight: '500',
            color: '#1c2b2c', paddingVertical: 13,
          }}
          returnKeyType="search"
        />
      </View>

      {/* CTA */}
      <TouchableOpacity
        onPress={onSearch}
        activeOpacity={0.85}
        style={{
          backgroundColor: C.teal,
          borderRadius: 16, paddingVertical: 15,
          alignItems: 'center', justifyContent: 'center',
          flexDirection: 'row', gap: 8,
          shadowColor: C.teal, shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
        }}
      >
        <Search size={16} color="white" />
        <Text style={{ color: 'white', fontWeight: '800', fontSize: 15, letterSpacing: 0.2 }}>
          Search Now
        </Text>
      </TouchableOpacity>

      {/* Trust logos */}
      <View style={{ marginTop: 20, paddingTop: 18, borderTopWidth: 1, borderTopColor: C.borderFaint }}>
        <Text style={{
          fontSize: 9, fontWeight: '700', color: C.textMuted,
          textTransform: 'uppercase', letterSpacing: 1.5,
          textAlign: 'center', marginBottom: 12,
        }}>Trusted by teams at</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24 }}>
          {['Airbnb', 'Microsoft', 'Bissell'].map(brand => (
            <Text key={brand} style={{
              color: C.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.3,
            }}>{brand}</Text>
          ))}
        </View>
      </View>
    </View>
  );
}

/** Sign In navigation card */
function SignInCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: C.surfaceUp,
        borderWidth: 1, borderColor: C.borderFaint,
        borderRadius: 24, padding: 18,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{
          width: 44, height: 44, borderRadius: 14,
          backgroundColor: C.tealDim, borderWidth: 1, borderColor: C.tealBorder,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Lock size={20} color={C.teal} />
        </View>
        <View>
          <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 15 }}>Sign In</Text>
          <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 1 }}>Access your dashboard</Text>
        </View>
      </View>
      <View style={{
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: C.borderFaint,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <ChevronRight size={16} color={C.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

/** Mini metric card */
function MetricCard({
  icon, value, label,
}: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: C.surfaceUp,
      borderWidth: 1, borderColor: C.borderFaint,
      borderRadius: 24, padding: 18,
    }}>
      <View style={{
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: C.goldDim,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
      }}>
        {icon}
      </View>
      <Text style={{ color: C.textPrimary, fontWeight: '800', fontSize: 20, letterSpacing: -0.5 }}>
        {value}
      </Text>
      <Text style={{ color: C.textMuted, fontSize: 10, fontWeight: '600', marginTop: 3 }}>
        {label}
      </Text>
    </View>
  );
}

/** Feature row item */
function FeatureRow({
  icon, title, description,
}: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'flex-start', gap: 14,
      paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: C.borderFaint,
    }}>
      <View style={{
        width: 40, height: 40, borderRadius: 13,
        backgroundColor: C.tealDim, borderWidth: 1, borderColor: C.tealBorder,
        alignItems: 'center', justifyContent: 'center', marginTop: 1,
      }}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 14 }}>{title}</Text>
        <Text style={{ color: C.textSecondary, fontSize: 12, marginTop: 3, lineHeight: 18 }}>
          {description}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function WelcomeScreen() {
  const router = useRouter();
  const [searchMode, setSearchMode] = useState<'talent' | 'jobs'>('talent');
  const [searchQuery, setSearchQuery] = useState('');

  const onSearch = () => {
    router.push(`/public/browse?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Promo Strip ── */}
        <SafeAreaView edges={['top']}>
          <PromoStrip onPress={() => router.push('/auth/register')} />
        </SafeAreaView>

        {/* ── Hero ── */}
        <View style={{ height: 460, width: '100%', overflow: 'hidden' }}>
          <ImageBackground
            source={{ uri: HERO_IMAGE }}
            style={{ flex: 1 }}
            imageStyle={{ opacity: 0.75, resizeMode: 'cover' }}
          >
            {/* Layered gradients for depth */}
            <LinearGradient
              colors={['rgba(13,22,23,0.88)', 'rgba(45,82,84,0.35)', 'rgba(13,22,23,0.60)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ ...StyleSheet.absoluteFillObject }}
            />
            <LinearGradient
              colors={['transparent', 'rgba(13,22,23,0.92)']}
              start={{ x: 0, y: 0.4 }} end={{ x: 0, y: 1 }}
              style={{ ...StyleSheet.absoluteFillObject }}
            />

            <View style={{
              flex: 1, justifyContent: 'center',
              paddingHorizontal: 28, paddingTop: 16,
            }}>
              {/* Badge */}
              <View style={{
                alignSelf: 'flex-start',
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: 'rgba(255,255,255,0.09)',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
                paddingHorizontal: 14, paddingVertical: 7,
                borderRadius: 100, marginBottom: 20,
              }}>
                <Globe size={11} color="rgba(255,255,255,0.55)" />
                <Text style={{
                  fontSize: 10, fontWeight: '700',
                  color: 'rgba(255,255,255,0.55)',
                  letterSpacing: 1.4, textTransform: 'uppercase',
                }}>Trusted by teams globally</Text>
              </View>

              {/* Headline */}
              <Text style={{
                fontSize: 36, fontWeight: '800', color: C.textPrimary,
                lineHeight: 42, letterSpacing: -1, marginBottom: 16,
              }}>
                Connecting businesses to{' '}
                <Text style={{ color: C.tealLight, fontWeight: '300', fontStyle: 'italic' }}>
                  talent that delivers
                </Text>
              </Text>

              {/* Sub copy */}
              <Text style={{
                fontSize: 14, color: 'rgba(240,244,244,0.70)',
                fontWeight: '400', lineHeight: 22, marginBottom: 24, maxWidth: 320,
              }}>
                Post structured gigs, review vetted applicants, and run contracts with clarity — all on Contractual.
              </Text>

              {/* Floating stat pill */}
              <HeroStatPill
                icon={<Users size={14} color={C.teal} />}
                label="12,400+ freelancers online"
              />
            </View>
          </ImageBackground>
        </View>

        {/* ── Search Dock (overlaps hero bottom) ── */}
        <View style={{ paddingHorizontal: 20, marginTop: -56 }}>
          <SearchDock
            mode={searchMode}
            onModeChange={setSearchMode}
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onSearch={onSearch}
          />
        </View>

        {/* ── Navigation + Stats ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 20, gap: 12 }}>

          {/* Sign In card */}
          <SignInCard onPress={() => router.push('/auth/signin')} />

          {/* Metric cards */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <MetricCard
              icon={<TrendingUp size={18} color={C.gold} />}
              value="8,400+"
              label="Verified Businesses"
            />
            <MetricCard
              icon={<Star size={18} color={C.gold} fill={C.gold} />}
              value="4.9 / 5"
              label="Satisfaction Rate"
            />
          </View>
        </View>

        {/* ── Why Contractual ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
          <View style={{
            backgroundColor: C.surfaceUp,
            borderWidth: 1, borderColor: C.borderFaint,
            borderRadius: 24, padding: 20,
          }}>
            <Text style={{
              fontSize: 11, fontWeight: '700', color: C.textMuted,
              textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4,
            }}>Why Contractual</Text>
            <Text style={{
              fontSize: 18, fontWeight: '800', color: C.textPrimary,
              letterSpacing: -0.4, marginBottom: 4,
            }}>Built for serious work</Text>

            <FeatureRow
              icon={<Shield size={18} color={C.teal} />}
              title="Escrow-protected payments"
              description="Funds are held securely until milestones are approved by both parties."
            />
            <FeatureRow
              icon={<CheckCircle2 size={18} color={C.teal} />}
              title="Vetted talent only"
              description="Every freelancer goes through skills verification before being listed."
            />
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingTop: 14 }}>
              <View style={{
                width: 40, height: 40, borderRadius: 13,
                backgroundColor: C.tealDim, borderWidth: 1, borderColor: C.tealBorder,
                alignItems: 'center', justifyContent: 'center', marginTop: 1,
              }}>
                <Briefcase size={18} color={C.teal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 14 }}>
                  Structured contracts
                </Text>
                <Text style={{ color: C.textSecondary, fontSize: 12, marginTop: 3, lineHeight: 18 }}>
                  Define scope, deadlines, and deliverables before work begins.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Register CTA ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <TouchableOpacity
            onPress={() => router.push('/auth/register')}
            activeOpacity={0.85}
            style={{
              backgroundColor: C.teal,
              borderRadius: 22, paddingVertical: 18,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
              shadowColor: C.teal, shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3, shadowRadius: 18, elevation: 10,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 16, letterSpacing: 0.2 }}>
              Create a Free Account
            </Text>
            <ArrowRight size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* ── Footer ── */}
        <Text style={{
          textAlign: 'center', color: C.textMuted, fontSize: 11,
          marginTop: 40, paddingHorizontal: 40, lineHeight: 18, fontWeight: '400',
        }}>
          Contractual Global Premium Marketplace Experience.{'\n'}© 2026 Contractual. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}

// Lightweight StyleSheet shim for absoluteFillObject used inside JSX
import { StyleSheet } from 'react-native';