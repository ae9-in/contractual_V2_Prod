import { useState, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import Constants from 'expo-constants';
import api from '../lib/api';

export interface AppVersionData {
  versionName: string;
  versionCode: number;
  isForced: boolean;
  updateUrl: string;
  changelog?: string;
}

export function useAppUpdate() {
  const [updateData, setUpdateData] = useState<AppVersionData | null>(null);
  const [isNewVersionAvailable, setIsNewVersionAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Current version from app.json
  const currentVersionName = Constants.expoConfig?.version || '1.0.0';
  
  // Custom version code - should match your build number
  // In Expo, this is often android.versionCode or ios.buildNumber
  const currentVersionCode = Platform.select({
    android: Constants.expoConfig?.android?.versionCode || 1,
    ios: parseInt(Constants.expoConfig?.ios?.buildNumber || '1'),
    default: 1
  });

  const checkUpdate = async () => {
    try {
      const platform = Platform.OS.toUpperCase();
      const response = await api.get(`/api/app/version/latest?platform=${platform}`);
      
      if (response.data) {
        const latest = response.data;
        
        // Compare version codes
        if (latest.versionCode > currentVersionCode) {
          setUpdateData(latest);
          setIsNewVersionAvailable(true);
        }
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUpdate();
  }, []);

  const performUpdate = () => {
    if (updateData?.updateUrl) {
      Linking.openURL(updateData.updateUrl);
    }
  };

  return {
    isNewVersionAvailable,
    isForced: updateData?.isForced || false,
    updateData,
    isLoading,
    performUpdate,
    currentVersionName,
    currentVersionCode
  };
}
