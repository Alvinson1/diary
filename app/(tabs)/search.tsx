import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { DiaryEntry } from '@/types/diary';
import { useTheme } from '@/hooks/useTheme';
import { storageService } from '@/utils/storage';
import { SearchBar } from '@/components/SearchBar';
import { EntryCard } from '@/components/EntryCard';
import { router } from 'expo-router';

export default function SearchScreen() {
  const { theme } = useTheme();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [searchQuery, entries]);

  const loadEntries = async () => {
    try {
      const storedEntries = await storageService.getEntries();
      const sortedEntries = storedEntries.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setEntries(sortedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const filterEntries = () => {
    if (!searchQuery.trim()) {
      setFilteredEntries([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = entries.filter(entry => 
      entry.title.toLowerCase().includes(query) ||
      entry.content.toLowerCase().includes(query) ||
      entry.tags.some(tag => tag.toLowerCase().includes(query))
    );
    setFilteredEntries(filtered);
  };

  const handleEntryPress = (entry: DiaryEntry) => {
    router.push(`/entry/${entry.id}`);
  };

  const renderEntry = ({ item }: { item: DiaryEntry }) => (
    <EntryCard entry={item} onPress={() => handleEntryPress(item)} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {searchQuery ? (
        <>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Results Found</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Try searching with different keywords or check your spelling
          </Text>
        </>
      ) : (
        <>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Search Your Memories</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Search through your diary entries by title, content, or tags
          </Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Search</Text>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search entries, tags, or content..."
      />

      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
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