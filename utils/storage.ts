import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiaryEntry, UserPreferences, SecuritySettings } from '@/types/diary';

const ENTRIES_KEY = 'diary_entries';
const USER_PREFERENCES_KEY = 'user_preferences';
const SECURITY_SETTINGS_KEY = 'security_settings';
const LAST_ACTIVITY_KEY = 'last_activity';

export const storageService = {
  async getEntries(): Promise<DiaryEntry[]> {
    try {
      const entries = await AsyncStorage.getItem(ENTRIES_KEY);
      return entries ? JSON.parse(entries) : [];
    } catch (error) {
      console.error('Error loading entries:', error);
      return [];
    }
  },

  async saveEntry(entry: DiaryEntry): Promise<void> {
    try {
      const entries = await this.getEntries();
      const existingIndex = entries.findIndex(e => e.id === entry.id);
      
      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }
      
      await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving entry:', error);
      throw error;
    }
  },

  async deleteEntry(id: string): Promise<void> {
    try {
      const entries = await this.getEntries();
      const filteredEntries = entries.filter(e => e.id !== id);
      await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(filteredEntries));
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  },

  async clearAllEntries(): Promise<void> {
    try {
      await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify([]));
    } catch (error) {
      console.error('Error clearing entries:', error);
      throw error;
    }
  },

  async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const prefs = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
      return prefs ? JSON.parse(prefs) : null;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return null;
    }
  },

  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  },

  async getSecuritySettings(): Promise<SecuritySettings | null> {
    try {
      const settings = await AsyncStorage.getItem(SECURITY_SETTINGS_KEY);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error loading security settings:', error);
      return null;
    }
  },

  async saveSecuritySettings(settings: SecuritySettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SECURITY_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving security settings:', error);
      throw error;
    }
  },

  async updateLastActivity(): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error updating last activity:', error);
    }
  },

  async getLastActivity(): Promise<number | null> {
    try {
      const activity = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
      return activity ? parseInt(activity, 10) : null;
    } catch (error) {
      console.error('Error getting last activity:', error);
      return null;
    }
  },

  async clearSecurityData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SECURITY_SETTINGS_KEY);
      await AsyncStorage.removeItem(LAST_ACTIVITY_KEY);
    } catch (error) {
      console.error('Error clearing security data:', error);
      throw error;
    }
  }
};