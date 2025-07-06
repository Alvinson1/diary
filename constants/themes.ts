import { Theme } from '@/types/diary';

export const lightTheme: Theme = {
  name: 'Light',
  primary: '#6366F1',
  secondary: '#8B5CF6',
  accent: '#EC4899',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

export const darkTheme: Theme = {
  name: 'Dark',
  primary: '#818CF8',
  secondary: '#A78BFA',
  accent: '#F472B6',
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
};

export const moodColors = {
  amazing: '#10B981',
  happy: '#3B82F6',
  neutral: '#6B7280',
  sad: '#F59E0B',
  angry: '#EF4444',
};

export const moodEmojis = {
  amazing: '😍',
  happy: '😊',
  neutral: '😐',
  sad: '😢',
  angry: '😠',
};