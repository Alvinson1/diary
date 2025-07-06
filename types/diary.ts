export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: MoodType;
  tags: string[];
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEntry {
  id: string;
  time: string;
  title: string;
  content: string;
  mood: MoodType;
  photos?: string[];
  audioNote?: string;
  type?: 'event' | 'reflection' | 'routine' | 'milestone';
}

export type MoodType = 'amazing' | 'happy' | 'neutral' | 'sad' | 'angry';

export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
    biometricEnabled: boolean;
    reminderEnabled: boolean;
    reminderTime: string;
  };
}