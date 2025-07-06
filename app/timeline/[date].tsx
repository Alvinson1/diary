import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Plus, Camera, Mic, Clock } from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  SlideInRight, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay,
  interpolate
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { TimelineEntry } from '@/types/diary';
import { storageService } from '@/utils/storage';
import { format, parseISO } from 'date-fns';

const { width } = Dimensions.get('window');

export default function TimelineScreen() {
  const theme = useTheme();
  const { date } = useLocalSearchParams();
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    loadTimelineEntries();
  }, [date]);

  const loadTimelineEntries = async () => {
    try {
      // Mock data for demonstration - replace with actual storage logic
      const mockEntries: TimelineEntry[] = [
        {
          id: '1',
          time: '13:00',
          title: 'My birthday party',
          content: 'Had an amazing birthday celebration with friends and family!',
          mood: 'amazing',
          photos: [
            'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=400'
          ],
          type: 'event'
        },
        {
          id: '2',
          time: '11:45',
          title: 'New beginnings',
          content: 'Today is the first day of my new life! I am moving to a new city and meeting new people. Hopefully, I will have a good time here...',
          mood: 'happy',
          audioNote: '00:49',
          type: 'reflection'
        },
        {
          id: '3',
          time: '07:12',
          title: 'Morning routine',
          content: 'Started the day with meditation and a healthy breakfast. Feeling grateful for this new chapter.',
          mood: 'neutral',
          type: 'routine'
        }
      ];
      setEntries(mockEntries);
    } catch (error) {
      console.error('Error loading timeline entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = () => {
    router.push(`/create?date=${date}`);
  };

  const moodEmojis = {
    amazing: '😍',
    happy: '😊',
    neutral: '😐',
    sad: '😢',
    angry: '😠'
  };

  const moodColors = {
    amazing: '#10B981',
    happy: '#3B82F6',
    neutral: '#6B7280',
    sad: '#F59E0B',
    angry: '#EF4444'
  };

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0.8]);
    const translateY = interpolate(scrollY.value, [0, 100], [0, -10]);
    
    return {
      opacity,
      transform: [{ translateY }]
    };
  });

  const renderTimelineEntry = (entry: TimelineEntry, index: number) => (
    <Animated.View
      key={entry.id}
      entering={FadeInDown.delay(index * 100).springify()}
      style={[styles.timelineItem, { borderLeftColor: theme.primary }]}
    >
      <View style={styles.timeContainer}>
        <View style={[styles.timeDot, { backgroundColor: moodColors[entry.mood] }]}>
          <Text style={styles.moodEmoji}>{moodEmojis[entry.mood]}</Text>
        </View>
        <Text style={[styles.timeText, { color: theme.primary }]}>{entry.time}</Text>
      </View>

      <Animated.View 
        entering={SlideInRight.delay(index * 150).springify()}
        style={[styles.entryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <View style={styles.entryHeader}>
          <Text style={[styles.entryTitle, { color: theme.text }]}>{entry.title}</Text>
          {entry.type && (
            <View style={[styles.typeTag, { backgroundColor: theme.primary + '20' }]}>
              <Text style={[styles.typeText, { color: theme.primary }]}>{entry.type}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.entryContent, { color: theme.textSecondary }]}>
          {entry.content}
        </Text>

        {entry.photos && entry.photos.length > 0 && (
          <Animated.View 
            entering={FadeInUp.delay(index * 200).springify()}
            style={styles.photosContainer}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {entry.photos.map((photo, photoIndex) => (
                <Animated.View
                  key={photoIndex}
                  entering={FadeInDown.delay(index * 200 + photoIndex * 50).springify()}
                >
                  <Image source={{ uri: photo }} style={styles.photo} />
                  {photoIndex === 2 && entry.photos!.length > 3 && (
                    <View style={styles.photoOverlay}>
                      <Text style={styles.photoOverlayText}>+{entry.photos!.length - 3}</Text>
                    </View>
                  )}
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {entry.audioNote && (
          <Animated.View 
            entering={FadeInUp.delay(index * 250).springify()}
            style={[styles.audioContainer, { backgroundColor: theme.background }]}
          >
            <Mic size={16} color={theme.primary} />
            <Text style={[styles.audioText, { color: theme.textSecondary }]}>{entry.audioNote}</Text>
            <Text style={[styles.audioLabel, { color: theme.textSecondary }]}>Voice note</Text>
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading timeline...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Your Timeline</Text>
          <Text style={[styles.headerDate, { color: theme.textSecondary }]}>
            {format(parseISO(date as string), 'EEEE, d MMMM')}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={handleAddEntry}
          style={[styles.addButton, { backgroundColor: theme.primary }]}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.timeline}>
          {entries.map((entry, index) => renderTimelineEntry(entry, index))}
        </View>

        <Animated.View 
          entering={FadeInUp.delay(entries.length * 100).springify()}
          style={styles.addEntryPrompt}
        >
          <TouchableOpacity 
            onPress={handleAddEntry}
            style={[styles.addEntryButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Clock size={20} color={theme.primary} />
            <Text style={[styles.addEntryText, { color: theme.primary }]}>
              Add a moment to your timeline
            </Text>
          </TouchableOpacity>
        </Animated.View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerDate: {
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
  },
  timeline: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 32,
    borderLeftWidth: 2,
    paddingLeft: 20,
    position: 'relative',
  },
  timeContainer: {
    position: 'absolute',
    left: -28,
    top: 0,
    alignItems: 'center',
    width: 56,
  },
  timeDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  moodEmoji: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  entryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  entryContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  photosContainer: {
    marginBottom: 12,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 8,
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 8,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoOverlayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  audioText: {
    fontSize: 14,
    fontWeight: '500',
  },
  audioLabel: {
    fontSize: 12,
    marginLeft: 'auto',
  },
  addEntryPrompt: {
    padding: 20,
    paddingBottom: 40,
  },
  addEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 8,
  },
  addEntryText: {
    fontSize: 16,
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
});