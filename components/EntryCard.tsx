import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DiaryEntry } from '@/types/diary';
import { useTheme } from '@/hooks/useTheme';
import { moodColors, moodEmojis } from '@/constants/themes';
import { format } from 'date-fns';
import { hapticFeedback } from '@/utils/haptics';

interface EntryCardProps {
  entry: DiaryEntry;
  onPress: () => void;
}

export function EntryCard({ entry, onPress }: EntryCardProps) {
  const theme = useTheme();

  const handlePress = () => {
    hapticFeedback.light();
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Text style={[styles.date, { color: theme.text }]}>
            {format(new Date(entry.date), 'MMM d, yyyy')}
          </Text>
          <Text style={[styles.time, { color: theme.textSecondary }]}>
            {format(new Date(entry.createdAt), 'h:mm a')}
          </Text>
        </View>
        <View style={[styles.moodIndicator, { backgroundColor: moodColors[entry.mood] }]}>
          <Text style={styles.moodEmoji}>{moodEmojis[entry.mood]}</Text>
        </View>
      </View>
      
      {entry.title && (
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {entry.title}
        </Text>
      )}
      
      <Text style={[styles.content, { color: theme.textSecondary }]} numberOfLines={3}>
        {entry.content}
      </Text>
      
      {entry.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {entry.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: theme.primary + '20' }]}>
              <Text style={[styles.tagText, { color: theme.primary }]}>#{tag}</Text>
            </View>
          ))}
          {entry.tags.length > 3 && (
            <Text style={[styles.moreText, { color: theme.textSecondary }]}>
              +{entry.tags.length - 3} more
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 14,
    marginTop: 2,
  },
  moodIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});