import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Animated, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  PlusCircle, ArrowLeft, ChevronRight, CheckCircle2, X,
  FileText, DollarSign, Tag, Layers, Users2, AlertCircle
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../lib/api';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'development', emoji: '💻', label: 'Development' },
  { id: 'design', emoji: '🎨', label: 'Design' },
  { id: 'marketing', emoji: '📈', label: 'Marketing' },
  { id: 'writing', emoji: '✍️', label: 'Writing' },
  { id: 'management', emoji: '📊', label: 'Management' },
  { id: 'legal', emoji: '⚖️', label: 'Legal' },
  { id: 'finance', emoji: '💰', label: 'Finance' },
  { id: 'video', emoji: '🎬', label: 'Video' },
];

const BUDGET_PRESETS = [500, 1000, 2500, 5000, 10000];
const EXPERIENCE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'EXPERT'];
const BUDGET_TYPES = ['FIXED', 'HOURLY'];
const SKILL_SUGGESTIONS = ['React', 'TypeScript', 'Node.js', 'Python', 'Figma', 'Next.js', 'Vue.js', 'Flutter'];

const STEPS = [
  { id: 1, label: 'Basics', icon: FileText },
  { id: 2, label: 'Budget', icon: DollarSign },
  { id: 3, label: 'Details', icon: Layers },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 28 }}>
      {STEPS.map((step, i) => {
        const active = step.id === currentStep;
        const done = step.id < currentStep;
        const Icon = step.icon;
        return (
          <React.Fragment key={step.id}>
            <View style={{ alignItems: 'center' }}>
              <View style={{
                width: 44, height: 44, borderRadius: 22,
                backgroundColor: done ? '#6d9c9f' : active ? '#2d7a7e' : '#f1f5f9',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: active ? 2 : 0, borderColor: '#6d9c9f',
              }}>
                {done
                  ? <CheckCircle2 size={22} color="white" />
                  : <Icon size={18} color={active ? 'white' : '#94a3b8'} />
                }
              </View>
              <Text style={{
                fontSize: 10, fontWeight: '700', marginTop: 4,
                color: active || done ? '#2d7a7e' : '#94a3b8',
                textTransform: 'uppercase', letterSpacing: 0.5
              }}>{step.label}</Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={{
                flex: 1, height: 2, marginHorizontal: 8, marginBottom: 20,
                backgroundColor: step.id < currentStep ? '#6d9c9f' : '#e2e8f0'
              }} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function InputLabel({ children }: { children: string }) {
  return (
    <Text style={{ fontSize: 12, fontWeight: '800', color: '#1c2b2c',
      textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
      {children}
    </Text>
  );
}

function StyledInput({
  value, onChangeText, placeholder, multiline = false,
  keyboardType = 'default', numberOfLines = 1
}: any) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      numberOfLines={multiline ? numberOfLines : undefined}
      keyboardType={keyboardType}
      textAlignVertical={multiline ? 'top' : 'center'}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholderTextColor="#94a3b8"
      style={{
        backgroundColor: 'white',
        borderWidth: 1.5,
        borderColor: focused ? '#6d9c9f' : '#e2e8f0',
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: multiline ? 14 : 0,
        height: multiline ? undefined : 52,
        minHeight: multiline ? 100 : undefined,
        fontSize: 15,
        fontWeight: '500',
        color: '#1c2b2c',
        shadowColor: focused ? '#6d9c9f' : 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: focused ? 4 : 0,
      }}
    />
  );
}

export default function PostGigScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Basics
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);

  // Step 2: Budget
  const [budgetType, setBudgetType] = useState<'FIXED' | 'HOURLY'>('FIXED');
  const [budget, setBudget] = useState('');
  const [hourlyMin, setHourlyMin] = useState('');
  const [hourlyMax, setHourlyMax] = useState('');
  const [budgetPreset, setBudgetPreset] = useState<number | null>(null);
  const [experienceLevel, setExperienceLevel] = useState('INTERMEDIATE');

  // Step 3: Details
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [hireCount, setHireCount] = useState('1');

  const addSkill = (s: string) => {
    const t = s.trim();
    if (!t || skills.includes(t)) return;
    setSkills([...skills, t]);
    setSkillInput('');
    setShowSkillSuggestions(false);
  };

  const removeSkill = (s: string) => setSkills(skills.filter(x => x !== s));

  const filteredSuggestions = SKILL_SUGGESTIONS.filter(
    s => s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s)
  );

  const canProceedStep1 = title.trim().length >= 10 && category !== '' && skills.length >= 1;
  const canProceedStep2 = budgetType === 'FIXED'
    ? Number(budget) >= 100
    : Number(hourlyMin) >= 10 && Number(hourlyMax) > Number(hourlyMin);
  const canPublish = description.trim().length >= 30;

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      const body: any = {
        title: title.trim(),
        description: description.trim(),
        category,
        budgetType,
        minBudget: budgetType === 'FIXED' ? Number(budget) : Number(hourlyMin),
        maxBudget: budgetType === 'FIXED' ? Number(budget) : Number(hourlyMax),
        currency: 'INR',
        experienceLevel,
        requiredSkills: skills,
        duration: duration || '2-4 weeks',
        isUrgent: false,
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
      };
      await api.post('/api/gigs', body);
      Alert.alert('🎉 Gig Published!', 'Your gig is now live and accepting applications.', [
        { text: 'View My Gigs', onPress: () => router.replace('/(business)/my-gigs') },
      ]);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to publish gig.';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) { Alert.alert('Add a title first'); return; }
    setIsLoading(true);
    try {
      await api.post('/api/gigs', {
        isDraft: true,
        title: title.trim(),
        description: description || undefined,
        category: category || undefined,
        budgetType: budgetType || undefined,
        minBudget: budget ? Number(budget) : undefined,
        maxBudget: budget ? Number(budget) : undefined,
        requiredSkills: skills.length ? skills : undefined,
      });
      Alert.alert('Draft Saved', 'Your draft has been saved.', [
        { text: 'OK', onPress: () => router.replace('/(business)/my-gigs') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to save draft.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafa' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <LinearGradient
          colors={['#6d9c9f', '#2d7a7e']}
          style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 8 }}>
              <ArrowLeft size={20} color="white" />
            </TouchableOpacity>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>Post a Gig</Text>
            <TouchableOpacity onPress={handleSaveDraft} disabled={isLoading}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12,
                paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>Save Draft</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}
          keyboardShouldPersistTaps="handled">
          <StepIndicator currentStep={step} />

          {/* STEP 1: BASICS */}
          {step === 1 && (
            <View>
              <InputLabel>What work do you need done? *</InputLabel>
              <StyledInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Build a React Dashboard for SaaS App"
              />
              <Text style={{ color: title.length >= 10 ? '#6d9c9f' : '#94a3b8',
                fontSize: 11, fontWeight: '600', textAlign: 'right', marginTop: 4, marginBottom: 20 }}>
                {title.length}/100
              </Text>

              <InputLabel>Category *</InputLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategory(cat.id)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: category === cat.id ? '#6d9c9f' : '#e2e8f0',
                      backgroundColor: category === cat.id ? '#f0f9fa' : 'white',
                      flexDirection: 'row', alignItems: 'center', gap: 6,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
                    <Text style={{ fontWeight: '700', fontSize: 13,
                      color: category === cat.id ? '#2d7a7e' : '#64748b' }}>
                      {cat.label}
                    </Text>
                    {category === cat.id && <CheckCircle2 size={14} color="#6d9c9f" />}
                  </TouchableOpacity>
                ))}
              </View>

              <InputLabel>Required Skills * (add at least 1)</InputLabel>
              <View style={{ position: 'relative', marginBottom: 8 }}>
                <TextInput
                  value={skillInput}
                  onChangeText={(t) => { setSkillInput(t); setShowSkillSuggestions(true); }}
                  onFocus={() => setShowSkillSuggestions(true)}
                  onSubmitEditing={() => addSkill(skillInput)}
                  placeholder="e.g. React, Figma, Node.js..."
                  placeholderTextColor="#94a3b8"
                  returnKeyType="done"
                  style={{
                    backgroundColor: 'white', borderWidth: 1.5, borderColor: '#e2e8f0',
                    borderRadius: 16, paddingHorizontal: 18, height: 52,
                    fontSize: 15, fontWeight: '500', color: '#1c2b2c',
                  }}
                />
              </View>
              {showSkillSuggestions && skillInput.length > 0 && filteredSuggestions.length > 0 && (
                <View style={{
                  backgroundColor: 'white', borderRadius: 16, borderWidth: 1,
                  borderColor: '#e2e8f0', marginBottom: 8, overflow: 'hidden',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
                }}>
                  {filteredSuggestions.slice(0, 4).map((s) => (
                    <TouchableOpacity key={s} onPress={() => addSkill(s)}
                      style={{ paddingHorizontal: 18, paddingVertical: 12,
                        borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                      <Text style={{ color: '#1c2b2c', fontWeight: '600', fontSize: 14 }}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                {skills.map((s) => (
                  <View key={s} style={{
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    backgroundColor: '#f0f9fa', borderRadius: 20, paddingVertical: 7,
                    paddingLeft: 14, paddingRight: 10, borderWidth: 1, borderColor: '#d8e4e5'
                  }}>
                    <Text style={{ color: '#2d7a7e', fontWeight: '700', fontSize: 13 }}>{s}</Text>
                    <TouchableOpacity onPress={() => removeSkill(s)}>
                      <X size={14} color="#6d9c9f" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* STEP 2: BUDGET */}
          {step === 2 && (
            <View>
              <InputLabel>Budget Type *</InputLabel>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
                {BUDGET_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setBudgetType(t as 'FIXED' | 'HOURLY')}
                    style={{
                      flex: 1, padding: 18, borderRadius: 18, alignItems: 'center',
                      borderWidth: 2,
                      borderColor: budgetType === t ? '#6d9c9f' : '#e2e8f0',
                      backgroundColor: budgetType === t ? '#f0f9fa' : 'white',
                    }}
                  >
                    <Text style={{ fontSize: 24, marginBottom: 6 }}>
                      {t === 'FIXED' ? '💰' : '⏱'}
                    </Text>
                    <Text style={{ fontWeight: '800', color: budgetType === t ? '#2d7a7e' : '#64748b', fontSize: 14 }}>
                      {t === 'FIXED' ? 'Fixed Price' : 'Hourly Rate'}
                    </Text>
                    <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
                      {t === 'FIXED' ? 'One-time payment' : 'Pay per hour'}
                    </Text>
                    {budgetType === t && (
                      <View style={{ position: 'absolute', top: 10, right: 10 }}>
                        <CheckCircle2 size={16} color="#6d9c9f" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {budgetType === 'FIXED' ? (
                <>
                  <InputLabel>Budget Amount (₹) *</InputLabel>
                  <View style={{ position: 'relative', marginBottom: 14 }}>
                    <Text style={{ position: 'absolute', left: 18, zIndex: 1, color: '#6d9c9f',
                      fontWeight: '700', fontSize: 18, lineHeight: 52 }}>₹</Text>
                    <TextInput
                      value={budget}
                      onChangeText={(v) => { setBudget(v); setBudgetPreset(null); }}
                      placeholder="0"
                      keyboardType="numeric"
                      placeholderTextColor="#94a3b8"
                      style={{
                        backgroundColor: 'white', borderWidth: 1.5, borderColor: '#e2e8f0',
                        borderRadius: 16, paddingLeft: 36, paddingRight: 18, height: 52,
                        fontSize: 18, fontWeight: '700', color: '#1c2b2c',
                      }}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                    {BUDGET_PRESETS.map((p) => (
                      <TouchableOpacity key={p} onPress={() => { setBudget(String(p)); setBudgetPreset(p); }}
                        style={{
                          paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
                          backgroundColor: budgetPreset === p ? '#6d9c9f' : '#f1f5f9',
                        }}>
                        <Text style={{ fontWeight: '700', fontSize: 13,
                          color: budgetPreset === p ? 'white' : '#64748b' }}>
                          ₹{p >= 1000 ? `${p / 1000}k` : p}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <InputLabel>Hourly Rate Range (₹/hr) *</InputLabel>
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Min ₹/hr</Text>
                      <StyledInput value={hourlyMin} onChangeText={setHourlyMin}
                        placeholder="45" keyboardType="numeric" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>Max ₹/hr</Text>
                      <StyledInput value={hourlyMax} onChangeText={setHourlyMax}
                        placeholder="120" keyboardType="numeric" />
                    </View>
                  </View>
                </>
              )}

              <InputLabel>Experience Level *</InputLabel>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <TouchableOpacity key={lvl} onPress={() => setExperienceLevel(lvl)}
                    style={{
                      flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: experienceLevel === lvl ? '#6d9c9f' : '#e2e8f0',
                      backgroundColor: experienceLevel === lvl ? '#f0f9fa' : 'white',
                    }}>
                    <Text style={{ fontWeight: '700', fontSize: 11,
                      color: experienceLevel === lvl ? '#2d7a7e' : '#94a3b8',
                      textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {lvl === 'BEGINNER' ? 'Entry' : lvl === 'INTERMEDIATE' ? 'Mid' : 'Expert'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* STEP 3: DETAILS */}
          {step === 3 && (
            <View>
              <InputLabel>Project Description * (min 30 chars)</InputLabel>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Include scope, deliverables, tech stack, timeline expectations..."
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                placeholderTextColor="#94a3b8"
                style={{
                  backgroundColor: 'white', borderWidth: 1.5, borderColor: '#e2e8f0',
                  borderRadius: 16, padding: 18, minHeight: 160,
                  fontSize: 15, fontWeight: '500', color: '#1c2b2c', marginBottom: 6,
                }}
              />
              <Text style={{ color: description.length >= 30 ? '#6d9c9f' : '#94a3b8',
                fontSize: 11, textAlign: 'right', marginBottom: 24, fontWeight: '600' }}>
                {description.length}/2000
              </Text>

              <InputLabel>Project Duration</InputLabel>
              <StyledInput value={duration} onChangeText={setDuration}
                placeholder="e.g. 2-4 weeks, 1-3 months" />
              <View style={{ height: 24 }} />

              <InputLabel>Number of Hires</InputLabel>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
                {['1', '2', '3', '5+'].map((n) => (
                  <TouchableOpacity key={n} onPress={() => setHireCount(n)}
                    style={{
                      flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: hireCount === n ? '#6d9c9f' : '#e2e8f0',
                      backgroundColor: hireCount === n ? '#f0f9fa' : 'white',
                    }}>
                    <Text style={{ fontWeight: '800', fontSize: 16,
                      color: hireCount === n ? '#2d7a7e' : '#94a3b8' }}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Summary before publishing */}
              <View style={{
                backgroundColor: '#f0f9fa', borderRadius: 20, padding: 20,
                borderWidth: 1, borderColor: '#d8e4e5', marginBottom: 24
              }}>
                <Text style={{ fontWeight: '800', color: '#2d7a7e', fontSize: 14, marginBottom: 12 }}>
                  📋 Gig Summary
                </Text>
                {[
                  ['Title', title || '—'],
                  ['Category', category || '—'],
                  ['Skills', skills.join(', ') || '—'],
                  ['Budget', budgetType === 'FIXED' ? `₹${budget}` : `₹${hourlyMin}–${hourlyMax}/hr`],
                  ['Level', experienceLevel],
                ].map(([k, v]) => (
                  <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: '#62737a', fontSize: 13, fontWeight: '600' }}>{k}</Text>
                    <Text style={{ color: '#1c2b2c', fontSize: 13, fontWeight: '700', maxWidth: '60%', textAlign: 'right' }}>
                      {v}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Navigation Buttons */}
          {step < 3 ? (
            <TouchableOpacity
              onPress={() => setStep(step + 1)}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              style={{
                backgroundColor: step === 1 ? (canProceedStep1 ? '#6d9c9f' : '#d8e4e5')
                  : (canProceedStep2 ? '#6d9c9f' : '#d8e4e5'),
                borderRadius: 18, paddingVertical: 16, alignItems: 'center',
                flexDirection: 'row', justifyContent: 'center', gap: 8,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>
                Continue
              </Text>
              <ChevronRight size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handlePublish}
              disabled={isLoading || !canPublish}
              style={{
                backgroundColor: canPublish ? '#6d9c9f' : '#d8e4e5',
                borderRadius: 18, paddingVertical: 18, alignItems: 'center',
                flexDirection: 'row', justifyContent: 'center', gap: 8,
                shadowColor: '#6d9c9f', shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
              }}
            >
              {isLoading
                ? <ActivityIndicator color="white" />
                : <>
                    <Text style={{ color: 'white', fontWeight: '900', fontSize: 17, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Publish Gig
                    </Text>
                    <CheckCircle2 size={22} color="white" />
                  </>
              }
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
