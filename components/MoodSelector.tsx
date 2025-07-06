import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MoodType } from '@/types/diary';
import { moodColors, moodEmojis } from '@/constants/themes';
import { useTheme } from '@/hooks/useTheme';
import { hapticFeedback } from '@/utils/haptics';

interface MoodSelectorProps {
  selectedMood: MoodType;
  onMoodSelect: (mood: MoodType) => void;
}

const moods: MoodType[] = ['amazing', 'happy', 'neutral', 'sad', 'angry'];

export function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  const theme = useTheme();

  const handleMoodPress = (mood: MoodType) => {
    hapticFeedback.light();
    onMoodSelect(mood);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>How are you feeling?</Text>
      <View style={styles.moodContainer}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood}
            style={[
              styles.moodButton,
              { backgroundColor: theme.surface },
              selectedMood === mood && {
                backgroundColor: moodColors[mood],
                transform: [{ scale: 1.1 }],
              }
            ]}
            onPress={() => handleMoodPress(mood)}
          >
            <Text style={styles.moodEmoji}>{moodEmojis[mood]}</Text>
            <Text style={[
              styles.moodLabel,
              { color: selectedMood === mood ? '#FFFFFF' : theme.textSecondary }
            ]}>
              {mood.charAt(0).toUpperCase() + mood.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodButton: {
    flex: 1,
    minWidth: 60,
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});