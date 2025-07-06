import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { DiaryEntry } from '@/types/diary';
import { useTheme } from '@/hooks/useTheme';
import { storageService } from '@/utils/storage';
import { moodColors, moodEmojis } from '@/constants/themes';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday } from 'date-fns';
import { router } from 'expo-router';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function CalendarScreen() {
  const { theme } = useTheme();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const scale = useSharedValue(1);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const storedEntries = await storageService.getEntries();
      setEntries(storedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEntryForDate = (date: Date) => {
    return entries.find(entry => isSameDay(new Date(entry.date), date));
  };

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
    
    // Animate button press
    scale.value = withSpring(0.95, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 100 });
    });

    // Navigate to timeline view for the selected date
    const dateString = format(date, 'yyyy-MM-dd');
    router.push(`/timeline/${dateString}`);
  };

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const renderDay = (date: Date, index: number) => {
    const entry = getEntryForDate(date);
    const isSelected = isSameDay(date, selectedDate);
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isTodayDate = isToday(date);

    return (
      <Animated.View
        key={index}
        entering={FadeInDown.delay(index * 20).springify()}
      >
        <TouchableOpacity
          style={[
            styles.dayButton,
            { backgroundColor: theme.surface },
            isSelected && { backgroundColor: theme.primary },
            isTodayDate && { borderColor: theme.primary, borderWidth: 2 },
            !isCurrentMonth && { opacity: 0.3 },
          ]}
          onPress={() => handleDatePress(date)}
        >
          <Text style={[
            styles.dayText,
            { color: theme.text },
            isSelected && { color: '#FFFFFF' },
            !isCurrentMonth && { color: theme.textSecondary },
          ]}>
            {format(date, 'd')}
          </Text>
          {entry && (
            <View style={[styles.moodDot, { backgroundColor: moodColors[entry.mood] }]}>
              <Text style={styles.moodDotEmoji}>{moodEmojis[entry.mood]}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View 
        entering={FadeInDown.springify()}
        style={styles.header}
      >
        <Text style={[styles.title, { color: theme.text }]}>Your Timeline</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Tap any date to view your daily timeline
        </Text>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(100).springify()}
        style={[styles.calendarCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={handlePrevMonth}>
            <Text style={[styles.monthButton, { color: theme.primary }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: theme.text }]}>
            {format(currentMonth, 'MMMM yyyy').toUpperCase()}
          </Text>
          <TouchableOpacity onPress={handleNextMonth}>
            <Text style={[styles.monthButton, { color: theme.primary }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekDays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={[styles.weekDay, { color: theme.textSecondary }]}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendar}>
          {calendarDays.map((date, index) => renderDay(date, index))}
        </View>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(200).springify()}
        style={styles.instructionContainer}
      >
        <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
          📅 Select a date to explore your daily timeline with photos, notes, and memories
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  calendarCard: {
    margin: 20,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  monthButton: {
    fontSize: 32,
    fontWeight: '300',
    paddingHorizontal: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  weekDay: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    width: 40,
    textTransform: 'uppercase',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 8,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  moodDot: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moodDotEmoji: {
    fontSize: 10,
  },
  instructionContainer: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});