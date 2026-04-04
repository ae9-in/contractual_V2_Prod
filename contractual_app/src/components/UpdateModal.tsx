import React from 'react';
import { Modal, View, Text, TouchableOpacity, Linking, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Download, AlertCircle, Info, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface UpdateModalProps {
  visible: boolean;
  version: string;
  update_required: boolean;
  update_message?: string;
  apk_url: string;
  onClose: () => void;
}

export function UpdateModal({ visible, version, update_required, update_message, apk_url, onClose }: UpdateModalProps) {
  const handleUpdate = () => {
    Linking.openURL(apk_url).catch(err => console.error("URL error:", err));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ 
          backgroundColor: 'white', 
          width: '100%', 
          borderRadius: 24, 
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 10,
        }}>
          {/* Header Gradient */}
          <LinearGradient
            colors={['#1e3436', '#2d4d50']}
            style={{ padding: 24, alignItems: 'center' }}
          >
            <View style={{ 
              width: 56, height: 56, borderRadius: 20, 
              backgroundColor: 'rgba(255,255,255,0.15)', 
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Download color="white" size={28} />
            </View>
            <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', textAlign: 'center' }}>
              Update Available
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', marginTop: 4 }}>
              Version {version} is now ready!
            </Text>
          </LinearGradient>

          <View style={{ padding: 24 }}>
            {update_required && (
              <View style={{ 
                flexDirection: 'row', alignItems: 'center', gap: 10, 
                backgroundColor: '#fef2f2', padding: 12, borderRadius: 12, marginBottom: 20,
                borderWidth: 1, borderColor: '#fee2e2'
              }}>
                <AlertCircle size={18} color="#ef4444" />
                <Text style={{ color: '#b91c1c', fontSize: 13, fontWeight: '700', flex: 1 }}>
                  You must update to continue using the application.
                </Text>
              </View>
            )}

            {update_message ? (
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Info size={14} color="#64748b" />
                  <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Description
                  </Text>
                </View>
                <Text style={{ color: '#334155', fontSize: 14, lineHeight: 22, fontWeight: '500' }}>
                  {update_message}
                </Text>
              </View>
            ) : null}

            <View style={{ gap: 12 }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleUpdate}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ 
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
                    paddingVertical: 14, borderRadius: 16, gap: 10 
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>Update Now</Text>
                  <ArrowRight size={18} color="white" />
                </LinearGradient>
              </TouchableOpacity>

              {!update_required && (
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={onClose}
                  style={{ paddingVertical: 14, alignItems: 'center' }}
                >
                  <Text style={{ color: '#64748b', fontWeight: '700', fontSize: 15 }}>Maybe Later</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
