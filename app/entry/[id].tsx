import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, CreditCard as Edit, Trash2, Share } from 'lucide-react-native';
import { DiaryEntry } from '@/types/diary';
import { useTheme } from '@/hooks/useTheme';
import { storageService } from '@/utils/storage';
import { hapticFeedback } from '@/utils/haptics';
import { moodColors, moodEmojis } from '@/constants/themes';
import { format } from 'date-fns';

export default function EntryDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    try {
      const entries = await storageService.getEntries();
      const foundEntry = entries.find(e => e.id === id);
      setEntry(foundEntry || null);
    } catch (error) {
      console.error('Error loading entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    hapticFeedback.medium();
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this diary entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteEntry(id as string);
              hapticFeedback.success();
              router.back();
            } catch (error) {
              hapticFeedback.error();
              Alert.alert('Error', 'Failed to delete entry. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleShare = () => {
    hapticFeedback.light();
    Alert.alert(
      'Share Entry',
      'Sharing functionality will be available in the next update. You\'ll be able to share your entries as text or images.',
      [{ text: 'OK' }]
    );
  };

  const handleEdit = () => {
    hapticFeedback.light();
    Alert.alert(
      'Edit Entry',
      'Editing functionality will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.text }]}>Entry not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Edit size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Trash2 size={20} color={theme.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.entryHeader}>
          <View style={styles.dateContainer}>
            <Text style={[styles.date, { color: theme.text }]}>
              {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
            </Text>
            <Text style={[styles.time, { color: theme.textSecondary }]}>
              {format(new Date(entry.createdAt), 'h:mm a')}
            </Text>
          </View>
          <View style={[styles.moodContainer, { backgroundColor: moodColors[entry.mood] }]}>
            <Text style={styles.moodEmoji}>{moodEmojis[entry.mood]}</Text>
            <Text style={styles.moodText}>{entry.mood}</Text>
          </View>
        </View>

        {entry.title && (
          <Text style={[styles.title, { color: theme.text }]}>{entry.title}</Text>
        )}

        <Text style={[styles.entryContent, { color: theme.text }]}>{entry.content}</Text>

        {entry.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={[styles.tagsLabel, { color: theme.textSecondary }]}>Tags</Text>
            <View style={styles.tagsWrapper}>
              {entry.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={[styles.tagText, { color: theme.primary }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateContainer: {
    flex: 1,
  },
  date: {
    fontSize: 20,
    fontWeight: '600',
  },
  time: {
    fontSize: 14,
    marginTop: 4,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  moodEmoji: {
    fontSize: 18,
  },
  moodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  entryContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  tagsContainer: {
    marginBottom: 32,
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
  },
});