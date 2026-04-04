import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Briefcase, GraduationCap, Plus, Trash2, ExternalLink } from 'lucide-react-native';

export function SectionHeader({ title, onAction, actionLabel = 'Add' }: { title: string, onAction?: () => void, actionLabel?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <Text style={{ fontSize: 13, fontWeight: '900', color: '#1c2b2c', textTransform: 'uppercase', letterSpacing: 1 }}>{title}</Text>
      {onAction && (
        <TouchableOpacity onPress={onAction} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Plus size={14} color="#6d9c9f" />
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#6d9c9f', textTransform: 'uppercase' }}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function SkillChip({ name, level, onRemove }: { name: string, level?: string, onRemove?: () => void }) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fafa',
      borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
      borderWidth: 1, borderColor: '#d8e4e5', gap: 6
    }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: '#2d4547' }}>{name}</Text>
      {level && (
        <View style={{ backgroundColor: '#6d9c9f', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
          <Text style={{ color: 'white', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' }}>{level}</Text>
        </View>
      )}
      {onRemove && (
        <TouchableOpacity onPress={onRemove}>
          <Trash2 size={12} color="#dc2626" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export function PortfolioCard({ title, imageUrl, onPress }: { title: string, imageUrl?: string | null, onPress?: () => void }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={{
        width: 160, backgroundColor: 'white', borderRadius: 16, overflow: 'hidden',
        borderWidth: 1, borderColor: '#f1f5f9', marginRight: 12
      }}
    >
      <View style={{ height: 100, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <Briefcase size={24} color="#cbd5e1" />
        )}
      </View>
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }} numberOfLines={1}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function TimelineItem({ type, title, subtitle, dateRange, onRemove }: { 
  type: 'experience' | 'education', title: string, subtitle: string, dateRange: string, onRemove?: () => void 
}) {
  const Icon = type === 'experience' ? Briefcase : GraduationCap;
  const badgeColor = type === 'experience' ? '#ecfdf5' : '#eff6ff';
  const badgeText = type === 'experience' ? '#059669' : '#2563eb';

  return (
    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
      {/* Connector Line */}
      <View style={{ alignItems: 'center', marginRight: 12 }}>
        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: 'white', borderWidth: 3, borderColor: '#6d9c9f', zIndex: 1 }} />
        <View style={{ width: 2, flex: 1, backgroundColor: '#f1f5f9' }} />
      </View>
      
      <View style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#f1f5f9' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 6 }}>
              <View style={{ backgroundColor: badgeColor, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ color: badgeText, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }}>{type}</Text>
              </View>
              <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '700' }}>{dateRange}</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: '900', color: '#1c2b2c' }}>{title}</Text>
            <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '700', marginTop: 2 }}>{subtitle}</Text>
          </View>
          {onRemove && (
            <TouchableOpacity onPress={onRemove} style={{ padding: 6 }}>
              <Trash2 size={14} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
