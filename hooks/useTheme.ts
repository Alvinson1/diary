import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '@/constants/themes';
import { storageService } from '@/utils/storage';

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<'light' | 'dark' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const updateTheme = async (theme: 'light' | 'dark') => {
    try {
      const currentPreferences = await storageService.getUserPreferences() || {};
      const newPreferences = { ...currentPreferences, theme };
      await storageService.saveUserPreferences(newPreferences);
      setUserTheme(theme);
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  // Use user preference if available, otherwise fall back to system theme
  const activeTheme = userTheme || systemColorScheme || 'light';
  
  return {
    theme: activeTheme === 'dark' ? darkTheme : lightTheme,
    isDark: activeTheme === 'dark',
    isLoading,
    updateTheme,
    activeTheme
  };
}