import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal,
  ScrollView, ActivityIndicator, Alert, Switch
} from 'react-native';
import { X, Plus, Globe, ExternalLink, Box, Link, User, Briefcase, MapPin, Info, CreditCard } from 'lucide-react-native';
import api from '../lib/api';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function AddSkillModal({ visible, onClose, onSuccess }: BaseModalProps) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState('Expert');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.post('/api/freelancer/skills', { name, level });
      setName('');
      onSuccess();
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to add skill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#1c2b2c' }}>Add Skill</Text>
            <TouchableOpacity onPress={onClose}><X size={24} color="#94a3b8" /></TouchableOpacity>
          </View>
          
          <TextInput
            style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16 }}
            placeholder="Skill Name (e.g. React Native)"
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
            {['Beginner', 'Intermediate', 'Expert'].map(l => (
              <TouchableOpacity 
                key={l}
                onPress={() => setLevel(l)}
                style={{
                  flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
                  backgroundColor: level === l ? '#6d9c9f' : '#f8fafc',
                  borderWidth: 1, borderColor: level === l ? '#6d9c9f' : '#f1f5f9'
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: level === l ? 'white' : '#64748b' }}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            onPress={handleAdd}
            disabled={saving || !name.trim()}
            style={{ backgroundColor: '#6d9c9f', borderRadius: 16, padding: 18, alignItems: 'center', opacity: !name.trim() ? 0.6 : 1 }}
          >
            {saving ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>Add Skill</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export function AddPortfolioModal({ visible, onClose, onSuccess }: BaseModalProps) {
  const [title, setTitle] = useState('');
  const [url, setURL] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await api.post('/api/freelancer/portfolio', { title, url, description: desc });
      setTitle(''); setURL(''); setDesc('');
      onSuccess();
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to add portfolio item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#1c2b2c' }}>Add Work</Text>
            <TouchableOpacity onPress={onClose}><X size={24} color="#94a3b8" /></TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 12 }}
              placeholder="Project Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 12 }}
              placeholder="Project URL (optional)"
              value={url}
              onChangeText={setURL}
              keyboardType="url"
              autoCapitalize="none"
            />
            <TextInput
              style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 24, minHeight: 100, textAlignVertical: 'top' }}
              placeholder="Brief description of the work..."
              value={desc}
              onChangeText={setDesc}
              multiline
            />

            <TouchableOpacity 
              onPress={handleAdd}
              disabled={saving || !title.trim()}
              style={{ backgroundColor: '#6d9c9f', borderRadius: 16, padding: 18, alignItems: 'center', opacity: !title.trim() ? 0.6 : 1 }}
            >
              {saving ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>Save Project</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function AddExperienceModal({ visible, onClose, onSuccess }: BaseModalProps) {
  const [formData, setFormData] = useState({ title: '', company: '', startYear: '2024', endYear: '', current: false });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!formData.title || !formData.company) return;
    setSaving(true);
    try {
      await api.post('/api/freelancer/experience', {
        ...formData,
        startYear: parseInt(formData.startYear),
        endYear: formData.current ? null : parseInt(formData.endYear)
      });
      onSuccess();
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to add experience');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#1c2b2c' }}>Add Experience</Text>
            <TouchableOpacity onPress={onClose}><X size={24} color="#94a3b8" /></TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 12 }}
              placeholder="Job Title (e.g. UI Designer)"
              value={formData.title}
              onChangeText={t => setFormData({...formData, title: t})}
            />
            <TextInput
              style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 12 }}
              placeholder="Company Name"
              value={formData.company}
              onChangeText={t => setFormData({...formData, company: t})}
            />
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 4, marginLeft: 4 }}>START YEAR</Text>
                <TextInput
                  style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 14, fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9' }}
                  placeholder="2020"
                  value={formData.startYear}
                  onChangeText={t => setFormData({...formData, startYear: t})}
                  keyboardType="numeric"
                />
              </View>
              {!formData.current && (
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 4, marginLeft: 4 }}>END YEAR</Text>
                  <TextInput
                    style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 14, fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9' }}
                    placeholder="2024"
                    value={formData.endYear}
                    onChangeText={t => setFormData({...formData, endYear: t})}
                    keyboardType="numeric"
                  />
                </View>
              )}
            </View>
            <TouchableOpacity 
              onPress={() => setFormData({...formData, current: !formData.current})}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24, paddingLeft: 4 }}
            >
              <Switch value={formData.current} onValueChange={v => setFormData({...formData, current: v})} trackColor={{ true: '#6d9c9f' }} />
              <Text style={{ fontWeight: '700', color: '#4b5563' }}>I currently work here</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleAdd}
              disabled={saving || !formData.title || !formData.company}
              style={{ backgroundColor: '#6d9c9f', borderRadius: 16, padding: 18, alignItems: 'center' }}
            >
              {saving ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>Save Experience</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function AddEducationModal({ visible, onClose, onSuccess }: BaseModalProps) {
  const [formData, setFormData] = useState({ institution: '', degree: '', startYear: '2018', endYear: '2022' });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!formData.institution || !formData.degree) return;
    setSaving(true);
    try {
      await api.post('/api/freelancer/education', {
        ...formData,
        startYear: parseInt(formData.startYear),
        endYear: parseInt(formData.endYear)
      });
      onSuccess();
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to add education');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#1c2b2c' }}>Add Education</Text>
            <TouchableOpacity onPress={onClose}><X size={24} color="#94a3b8" /></TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 12 }}
              placeholder="School / University"
              value={formData.institution}
              onChangeText={t => setFormData({...formData, institution: t})}
            />
            <TextInput
              style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 12 }}
              placeholder="Degree (e.g. Bachelor of Design)"
              value={formData.degree}
              onChangeText={t => setFormData({...formData, degree: t})}
            />
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 4, marginLeft: 4 }}>START YEAR</Text>
                <TextInput
                  style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 14, fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9' }}
                  value={formData.startYear}
                  onChangeText={t => setFormData({...formData, startYear: t})}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 4, marginLeft: 4 }}>END YEAR</Text>
                <TextInput
                  style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 14, fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9' }}
                  value={formData.endYear}
                  onChangeText={t => setFormData({...formData, endYear: t})}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleAdd}
              disabled={saving || !formData.institution || !formData.degree}
              style={{ backgroundColor: '#6d9c9f', borderRadius: 16, padding: 18, alignItems: 'center' }}
            >
              {saving ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>Save Education</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
export function EditSocialLinksModal({ visible, onClose, onSuccess, initialData }: BaseModalProps) {
  const [formData, setFormData] = useState({
    linkedinUrl: initialData?.linkedinUrl || '',
    githubUrl: initialData?.githubUrl || '',
    websiteUrl: initialData?.websiteUrl || '',
    behanceUrl: initialData?.behanceUrl || ''
  });
  const [saving, setSaving] = useState(false);

  // Sync initialData when it changes
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        linkedinUrl: initialData.linkedinUrl || '',
        githubUrl: initialData.githubUrl || '',
        websiteUrl: initialData.websiteUrl || '',
        behanceUrl: initialData.behanceUrl || ''
      });
    }
  }, [initialData, visible]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/api/freelancer/profile', formData);
      onSuccess();
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to update social links');
    } finally {
      setSaving(false);
    }
  };

  const InputField = ({ label, icon, value, field, placeholder }: any) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 6, marginLeft: 4, textTransform: 'uppercase' }}>{label}</Text>
      <View style={{ 
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', 
        borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', paddingHorizontal: 16 
      }}>
        {icon}
        <TextInput
          style={{ flex: 1, padding: 14, fontSize: 15, fontWeight: '700', color: '#1e293b' }}
          placeholder={placeholder}
          value={value}
          onChangeText={t => setFormData({ ...formData, [field]: t })}
          autoCapitalize="none"
          keyboardType="url"
        />
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#1c2b2c' }}>Edit Social Links</Text>
            <TouchableOpacity onPress={onClose}><X size={24} color="#94a3b8" /></TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <InputField 
              label="LinkedIn" 
              icon={<ExternalLink size={20} color="#0077b5" />} 
              value={formData.linkedinUrl} 
              field="linkedinUrl" 
              placeholder="linkedin.com/in/username"
            />
            <InputField 
              label="GitHub" 
              icon={<ExternalLink size={20} color="#333" />} 
              value={formData.githubUrl} 
              field="githubUrl" 
              placeholder="github.com/username"
            />
            <InputField 
              label="Website" 
              icon={<Globe size={20} color="#6d9c9f" />} 
              value={formData.websiteUrl} 
              field="websiteUrl" 
              placeholder="yourwebsite.com"
            />
            <InputField 
              label="Behance" 
              icon={<Box size={20} color="#053eff" />} 
              value={formData.behanceUrl} 
              field="behanceUrl" 
              placeholder="behance.net/username"
            />

            <TouchableOpacity 
              onPress={handleSave}
              disabled={saving}
              style={{ backgroundColor: '#6d9c9f', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 10 }}
            >
              {saving ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>Save Changes</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
export function EditProfileInfoModal({ visible, onClose, onSuccess, initialData }: BaseModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    headline: initialData?.headline || '',
    bio: initialData?.bio || '',
    location: initialData?.location || '',
    hourlyRate: initialData?.hourlyRate?.toString() || '0',
    isAvailable: initialData?.isAvailable ?? true
  });
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        headline: initialData.headline || '',
        bio: initialData.bio || '',
        location: initialData.location || '',
        hourlyRate: initialData.hourlyRate?.toString() || '0',
        isAvailable: initialData.isAvailable ?? true
      });
    }
  }, [initialData, visible]);

  const handleSave = async () => {
    if (!formData.name.trim()) return Alert.alert('Error', 'Name is required');
    setSaving(true);
    try {
      await api.patch('/api/freelancer/profile', {
        ...formData,
        hourlyRate: parseFloat(formData.hourlyRate) || 0
      });
      onSuccess();
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile info');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, maxHeight: '90%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#1c2b2c' }}>Edit Profile Info</Text>
            <TouchableOpacity onPress={onClose}><X size={24} color="#94a3b8" /></TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 8, marginLeft: 4 }}>FULL NAME</Text>
              <TextInput
                style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9' }}
                value={formData.name}
                onChangeText={t => setFormData({...formData, name: t})}
                placeholder="Ex: John Doe"
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 8, marginLeft: 4 }}>PROFESSIONAL HEADLINE</Text>
              <TextInput
                style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9' }}
                value={formData.headline}
                onChangeText={t => setFormData({...formData, headline: t})}
                placeholder="Ex: UI Designer | React Developer"
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 8, marginLeft: 4 }}>LOCATION</Text>
              <TextInput
                style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9' }}
                value={formData.location}
                onChangeText={t => setFormData({...formData, location: t})}
                placeholder="Ex: Mumbai, India"
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 8, marginLeft: 4 }}>HOURLY RATE (₹)</Text>
              <TextInput
                style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9' }}
                value={formData.hourlyRate}
                onChangeText={t => setFormData({...formData, hourlyRate: t.replace(/[^0-9]/g, '')})}
                keyboardType="numeric"
                placeholder="Ex: 500"
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 8, marginLeft: 4 }}>ABOUT ME (BIO)</Text>
              <TextInput
                style={{ 
                  backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 15, 
                  fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9', minHeight: 120, textAlignVertical: 'top'
                }}
                value={formData.bio}
                onChangeText={t => setFormData({...formData, bio: t})}
                multiline
                placeholder="Tell clients about your expertise..."
              />
            </View>

            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
              style={{ 
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: '#f8fafc', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 32
              }}
            >
              <View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#1e293b' }}>Available for Work</Text>
                <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '700', marginTop: 2 }}>Show "Available" badge on profile</Text>
              </View>
              <Switch value={formData.isAvailable} onValueChange={v => setFormData({...formData, isAvailable: v})} trackColor={{ true: '#6d9c9f' }} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleSave}
              disabled={saving}
              style={{ backgroundColor: '#6d9c9f', borderRadius: 20, padding: 18, alignItems: 'center' }}
            >
              {saving ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>Save Changes</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function EditBusinessProfileModal({ visible, onClose, onSuccess, initialData }: BaseModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    companyName: initialData?.companyName || '',
    companyDesc: initialData?.companyDesc || '',
    industry: initialData?.industry || '',
    website: initialData?.website || '',
    location: initialData?.location || '',
  });
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        companyName: initialData.companyName || '',
        companyDesc: initialData.companyDesc || '',
        industry: initialData.industry || '',
        website: initialData.website || '',
        location: initialData.location || '',
      });
    }
  }, [initialData, visible]);

  const handleSave = async () => {
    if (!formData.name.trim()) return Alert.alert('Error', 'Name is required');
    setSaving(true);
    try {
      await api.patch('/api/business/profile', formData);
      onSuccess();
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, maxHeight: '90%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#1c2b2c' }}>Edit Business Profile</Text>
            <TouchableOpacity onPress={onClose}><X size={24} color="#94a3b8" /></TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 8, marginLeft: 4 }}>COMPANY NAME</Text>
              <TextInput
                style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9' }}
                value={formData.companyName}
                onChangeText={t => setFormData({...formData, companyName: t})}
                placeholder="Ex: Acme Inc"
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 8, marginLeft: 4 }}>CONTACT PERSON NAME</Text>
              <TextInput
                style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9' }}
                value={formData.name}
                onChangeText={t => setFormData({...formData, name: t})}
                placeholder="Ex: John Doe"
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 8, marginLeft: 4 }}>INDUSTRY</Text>
              <TextInput
                style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9' }}
                value={formData.industry}
                onChangeText={t => setFormData({...formData, industry: t})}
                placeholder="Ex: Software / Marketing"
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 8, marginLeft: 4 }}>WEBSITE URL</Text>
              <TextInput
                style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9' }}
                value={formData.website}
                onChangeText={t => setFormData({...formData, website: t})}
                placeholder="Ex: https://acme.com"
                autoCapitalize="none"
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 8, marginLeft: 4 }}>LOCATION</Text>
              <TextInput
                style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 15, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9' }}
                value={formData.location}
                onChangeText={t => setFormData({...formData, location: t})}
                placeholder="Ex: Mumbai, India"
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 8, marginLeft: 4 }}>ABOUT COMPANY</Text>
              <TextInput
                style={{ 
                  backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 15, 
                  fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9', minHeight: 120, textAlignVertical: 'top'
                }}
                value={formData.companyDesc}
                onChangeText={t => setFormData({...formData, companyDesc: t})}
                multiline
                placeholder="Tell us about your company and mission..."
              />
            </View>

            <TouchableOpacity 
              onPress={handleSave}
              disabled={saving}
              style={{ backgroundColor: '#6d9c9f', borderRadius: 20, padding: 18, alignItems: 'center' }}
            >
              {saving ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>Save Changes</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
