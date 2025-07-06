import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '@/constants/themes';
import { storageService } from '@/utils/storage';

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    loadUserTheme();
  }, []);

  const loadUserTheme = async () => {
    try {
      const preferences = await storageService.getUserPreferences();
      if (preferences?.theme) {
        setUserTheme(preferences.theme);
      }
    } catch (error) {
      console.error('Error loading user theme:', error);
    }
  };

  // Use user preference if available, otherwise fall back to system theme
  const activeTheme = userTheme || systemColorScheme || 'light';
  
  return activeTheme === 'dark' ? darkTheme : lightTheme;
}