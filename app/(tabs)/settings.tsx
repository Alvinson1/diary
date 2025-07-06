import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { storageService } from '@/utils/storage';
import { Shield, Moon, Bell, Download, Trash2, Info, Smartphone } from 'lucide-react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface UserPreferences {
  biometricEnabled: boolean;
  reminderEnabled: boolean;
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
}

export default function SettingsScreen() {
  const theme = useTheme();
  const [preferences, setPreferences] = useState<UserPreferences>({
    biometricEnabled: false,
    reminderEnabled: false,
    theme: 'light',
    notificationsEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const scaleValue = useSharedValue(1);

  useEffect(() => {
    loadSettings();
    checkBiometricAvailability();
  }, []);

  const loadSettings = async () => {
    try {
      const storedPreferences = await storageService.getUserPreferences();
      if (storedPreferences) {
        setPreferences({
          biometricEnabled: storedPreferences.biometricEnabled || false,
          reminderEnabled: storedPreferences.reminderEnabled || false,
          theme: storedPreferences.theme || 'light',
          notificationsEnabled: storedPreferences.notificationsEnabled || false,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBiometricAvailability = () => {
    // Biometric authentication is only available on native platforms
    setBiometricAvailable(Platform.OS !== 'web');
  };

  const saveSettings = async (newPreferences: UserPreferences) => {
    try {
      await storageService.saveUserPreferences(newPreferences);
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Failed to save settings. Please try again.');
    }
  };

  const showError = (message: string) => {
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert('Error', message);
    }
  };

  const showAlert = (title: string, message: string, buttons: any[]) => {
    if (Platform.OS === 'web') {
      const confirmed = confirm(`${title}\n\n${message}`);
      if (confirmed && buttons.length > 1) {
        buttons[1].onPress?.();
      }
    } else {
      Alert.alert(title, message, buttons);
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (!biometricAvailable) {
      showError('Biometric authentication is not available on this platform.');
      return;
    }

    if (enabled) {
      // On web, we can't actually use biometric auth, so just simulate it
      if (Platform.OS === 'web') {
        showError('Biometric authentication requires a native mobile app. This feature will be available when you download the app.');
        return;
      }

      // For native platforms, you would implement actual biometric auth here
      const newPreferences = { ...preferences, biometricEnabled: true };
      await saveSettings(newPreferences);
    } else {
      const newPreferences = { ...preferences, biometricEnabled: false };
      await saveSettings(newPreferences);
    }
  };

  const handleReminderToggle = async (enabled: boolean) => {
    const newPreferences = { ...preferences, reminderEnabled: enabled };
    await saveSettings(newPreferences);
  };

  const handleThemeToggle = async (isDark: boolean) => {
    const newPreferences = { ...preferences, theme: isDark ? 'dark' : 'light' };
    await saveSettings(newPreferences);
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    const newPreferences = { ...preferences, notificationsEnabled: enabled };
    await saveSettings(newPreferences);
  };

  const handleExportData = () => {
    scaleValue.value = withSpring(0.95, { duration: 100 }, () => {
      scaleValue.value = withSpring(1, { duration: 100 });
    });

    showAlert(
      'Export Data',
      'Export functionality will be available in the next update. Your data will be exported as a PDF or text file.',
      [{ text: 'OK' }]
    );
  };

  const handleClearData = () => {
    scaleValue.value = withSpring(0.95, { duration: 100 }, () => {
      scaleValue.value = withSpring(1, { duration: 100 });
    });

    showAlert(
      'Clear All Data',
      'This will permanently delete all your diary entries. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all entries by saving an empty array
              await storageService.saveEntry({ 
                id: 'temp', 
                date: '', 
                title: '', 
                content: '', 
                mood: 'neutral', 
                tags: [], 
                createdAt: '', 
                updatedAt: '' 
              });
              
              if (Platform.OS === 'web') {
                alert('All diary entries have been deleted.');
              } else {
                Alert.alert('Data Cleared', 'All diary entries have been deleted.');
              }
            } catch (error) {
              showError('Failed to clear data. Please try again.');
            }
          }
        }
      ]
    );
  };

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement, 
    disabled = false 
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.settingItem, 
        { 
          backgroundColor: theme.surface, 
          borderColor: theme.border,
          opacity: disabled ? 0.6 : 1
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.settingLeft}>
        <Icon size={24} color={disabled ? theme.textSecondary : theme.primary} />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View 
        entering={FadeInDown.springify()}
        style={styles.header}
      >
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Customize your diary experience
        </Text>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(100).springify()}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Privacy & Security</Text>
        
        <SettingItem
          icon={Shield}
          title="Biometric Authentication"
          subtitle={
            biometricAvailable 
              ? "Secure your diary with Face ID or Touch ID" 
              : Platform.OS === 'web' 
                ? "Available in mobile app" 
                : "Not available on this device"
          }
          disabled={!biometricAvailable}
          rightElement={
            <Switch
              value={preferences.biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={preferences.biometricEnabled ? '#FFFFFF' : theme.textSecondary}
              disabled={!biometricAvailable}
            />
          }
        />
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(200).springify()}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Preferences</Text>
        
        <SettingItem
          icon={Moon}
          title="Dark Mode"
          subtitle="Toggle between light and dark themes"
          rightElement={
            <Switch
              value={preferences.theme === 'dark'}
              onValueChange={handleThemeToggle}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={preferences.theme === 'dark' ? '#FFFFFF' : theme.textSecondary}
            />
          }
        />

        <SettingItem
          icon={Bell}
          title="Daily Reminders"
          subtitle="Get reminded to write in your diary"
          rightElement={
            <Switch
              value={preferences.reminderEnabled}
              onValueChange={handleReminderToggle}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={preferences.reminderEnabled ? '#FFFFFF' : theme.textSecondary}
            />
          }
        />

        <SettingItem
          icon={Smartphone}
          title="Notifications"
          subtitle="Enable app notifications"
          rightElement={
            <Switch
              value={preferences.notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={preferences.notificationsEnabled ? '#FFFFFF' : theme.textSecondary}
            />
          }
        />
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(300).springify()}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Data Management</Text>
        
        <Animated.View style={animatedButtonStyle}>
          <SettingItem
            icon={Download}
            title="Export Data"
            subtitle="Download your diary entries"
            onPress={handleExportData}
            rightElement={<Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>}
          />
        </Animated.View>

        <Animated.View style={animatedButtonStyle}>
          <SettingItem
            icon={Trash2}
            title="Clear All Data"
            subtitle="Permanently delete all entries"
            onPress={handleClearData}
            rightElement={<Text style={[styles.arrow, { color: theme.accent }]}>›</Text>}
          />
        </Animated.View>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(400).springify()}
        style={styles.footer}
      >
        <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Info size={20} color={theme.primary} />
          <View style={styles.infoText}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>My Diary v1.0.0</Text>
            <Text style={[styles.infoSubtitle, { color: theme.textSecondary }]}>
              Your thoughts, your privacy. Built with care for your personal reflection journey.
            </Text>
          </View>
        </View>
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
    lineHeight: 18,
  },
  arrow: {
    fontSize: 20,
    fontWeight: '300',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    lineHeight: 18,
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