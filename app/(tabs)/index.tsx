import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { DiaryEntry } from '@/types/diary';
import { useTheme } from '@/hooks/useTheme';
import { storageService } from '@/utils/storage';
import { hapticFeedback } from '@/utils/haptics';
import { EntryCard } from '@/components/EntryCard';
import { format, isToday } from 'date-fns';

export default function JournalScreen() {
  const { theme } = useTheme();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const storedEntries = await storageService.getEntries();
      const sortedEntries = storedEntries.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setEntries(sortedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = () => {
    hapticFeedback.light();
    router.push('/create');
  };

  const handleEntryPress = (entry: DiaryEntry) => {
    router.push(`/entry/${entry.id}`);
  };

  const renderEntry = ({ item }: { item: DiaryEntry }) => (
    <EntryCard entry={item} onPress={() => handleEntryPress(item)} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>Start Your Journey</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Create your first diary entry to begin capturing your thoughts and memories
      </Text>
    </View>
  );

  const todayEntry = entries.find(entry => isToday(new Date(entry.date)));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>My Journal</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {format(new Date(), 'EEEE, MMMM d')}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleCreateEntry}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {!todayEntry && (
        <TouchableOpacity
          style={[styles.quickEntryButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={handleCreateEntry}
        >
          <Text style={[styles.quickEntryText, { color: theme.primary }]}>
            ✨ Quick entry for today
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadEntries}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  quickEntryButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  quickEntryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});