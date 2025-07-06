import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { X, Save } from 'lucide-react-native';
import { DiaryEntry, MoodType } from '@/types/diary';
import { useTheme } from '@/hooks/useTheme';
import { storageService } from '@/utils/storage';
import { hapticFeedback } from '@/utils/haptics';
import { MoodSelector } from '@/components/MoodSelector';
import { format } from 'date-fns';

export default function CreateEntryScreen() {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodType>('neutral');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Entry', 'Please write something in your diary entry.');
      return;
    }

    setSaving(true);
    hapticFeedback.light();

    try {
      const entry: DiaryEntry = {
        id: Date.now().toString(),
        date: format(new Date(), 'yyyy-MM-dd'),
        title: title.trim(),
        content: content.trim(),
        mood,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await storageService.saveEntry(entry);
      hapticFeedback.success();
      router.back();
    } catch (error) {
      hapticFeedback.error();
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (content.trim() || title.trim()) {
      Alert.alert(
        'Discard Entry?',
        'Your entry will be lost if you continue.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <X size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.date, { color: theme.textSecondary }]}>
          {format(new Date(), 'EEEE, MMMM d')}
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Save size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={[styles.titleInput, { color: theme.text }]}
          placeholder="Entry title (optional)"
          placeholderTextColor={theme.textSecondary}
          value={title}
          onChangeText={setTitle}
          multiline
        />

        <TextInput
          style={[styles.contentInput, { color: theme.text }]}
          placeholder="What's on your mind today?"
          placeholderTextColor={theme.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          autoFocus
        />

        <MoodSelector selectedMood={mood} onMoodSelect={setMood} />

        <View style={styles.tagsContainer}>
          <Text style={[styles.tagsLabel, { color: theme.text }]}>Tags</Text>
          <TextInput
            style={[styles.tagsInput, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
            placeholder="Add tags separated by commas"
            placeholderTextColor={theme.textSecondary}
            value={tags}
            onChangeText={setTags}
          />
        </View>
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
  date: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
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
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    paddingVertical: 8,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
    marginBottom: 24,
    paddingVertical: 8,
  },
  tagsContainer: {
    marginBottom: 32,
  },
  tagsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tagsInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
});