import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiaryEntry } from '@/types/diary';

const ENTRIES_KEY = 'diary_entries';
const USER_PREFERENCES_KEY = 'user_preferences';

interface UserPreferences {
  biometricEnabled?: boolean;
  reminderEnabled?: boolean;
  theme?: 'light' | 'dark';
  notificationsEnabled?: boolean;
}

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
  }
};