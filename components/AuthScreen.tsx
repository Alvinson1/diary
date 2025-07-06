import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView,
  Dimensions,
  Platform 
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Lock, Fingerprint, Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface PatternDotProps {
  index: number;
  isSelected: boolean;
  onPress: (index: number) => void;
  theme: any;
}

function PatternDot({ index, isSelected, onPress, theme }: PatternDotProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.2, { duration: 100 }),
      withSpring(1, { duration: 100 })
    );
    onPress(index);
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.patternDot,
          { 
            backgroundColor: isSelected ? theme.primary : theme.surface,
            borderColor: theme.border 
          }
        ]}
        onPress={handlePress}
      >
        {isSelected && <View style={[styles.patternDotInner, { backgroundColor: theme.background }]} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function AuthScreen() {
  const { theme } = useTheme();
  const { 
    securitySettings, 
    biometricAvailable, 
    authenticateWithBiometric, 
    authenticateWithCredentials, 
    login 
  } = useAuth();

  const [input, setInput] = useState('');
  const [pattern, setPattern] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const shakeAnimation = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnimation.value }],
  }));

  useEffect(() => {
    // Auto-trigger biometric if available and enabled
    if (securitySettings?.biometricEnabled && biometricAvailable) {
      handleBiometricAuth();
    }
  }, [securitySettings, biometricAvailable]);

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    try {
      const success = await authenticateWithBiometric();
      if (success) {
        await login();
      } else {
        setError('Biometric authentication failed');
      }
    } catch (error) {
      setError('Biometric authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialAuth = async () => {
    if (!securitySettings) return;

    setIsLoading(true);
    setError('');

    try {
      let authInput: string | number[];
      
      if (securitySettings.authType === 'pattern') {
        authInput = pattern;
      } else {
        authInput = input;
      }

      const success = await authenticateWithCredentials(securitySettings.authType, authInput);
      
      if (success) {
        await login();
      } else {
        setError('Invalid credentials');
        triggerShake();
        clearInput();
      }
    } catch (error) {
      setError('Authentication error');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    shakeAnimation.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const clearInput = () => {
    setInput('');
    setPattern([]);
  };

  const handlePatternDot = (index: number) => {
    if (pattern.includes(index)) return;
    
    const newPattern = [...pattern, index];
    setPattern(newPattern);
    
    if (newPattern.length >= 4) {
      setTimeout(() => handleCredentialAuth(), 300);
    }
  };

  const getAuthTitle = () => {
    switch (securitySettings?.authType) {
      case 'pin':
        return 'Enter your PIN';
      case 'password':
        return 'Enter your password';
      case 'pattern':
        return 'Draw your pattern';
      default:
        return 'Authenticate';
    }
  };

  const renderAuthInput = () => {
    if (securitySettings?.authType === 'pattern') {
      return (
        <Animated.View 
          entering={FadeInUp.delay(200).springify()}
          style={styles.patternContainer}
        >
          <View style={styles.patternGrid}>
            {Array.from({ length: 9 }, (_, index) => (
              <PatternDot
                key={index}
                index={index}
                isSelected={pattern.includes(index)}
                onPress={handlePatternDot}
                theme={theme}
              />
            ))}
          </View>
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: theme.surface }]}
            onPress={clearInput}
          >
            <Text style={[styles.clearButtonText, { color: theme.textSecondary }]}>Clear</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <Animated.View 
        entering={FadeInUp.delay(200).springify()}
        style={styles.inputContainer}
      >
        <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Lock size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.textInput, { color: theme.text }]}
            value={input}
            onChangeText={setInput}
            placeholder={securitySettings?.authType === 'pin' ? 'Enter PIN' : 'Enter password'}
            placeholderTextColor={theme.textSecondary}
            secureTextEntry={securitySettings?.authType === 'password' && !showPassword}
            keyboardType={securitySettings?.authType === 'pin' ? 'numeric' : 'default'}
            maxLength={securitySettings?.authType === 'pin' ? 6 : undefined}
            autoFocus
            onSubmitEditing={handleCredentialAuth}
          />
          {securitySettings?.authType === 'password' && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color={theme.textSecondary} />
              ) : (
                <Eye size={20} color={theme.textSecondary} />
              )}
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[
            styles.authButton, 
            { 
              backgroundColor: theme.primary,
              opacity: input.length === 0 ? 0.5 : 1 
            }
          ]}
          onPress={handleCredentialAuth}
          disabled={input.length === 0 || isLoading}
        >
          <Text style={styles.authButtonText}>
            {isLoading ? 'Authenticating...' : 'Unlock'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View 
        entering={FadeInDown.springify()}
        style={[styles.content, shakeStyle]}
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
            <Lock size={32} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>My Diary</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {getAuthTitle()}
          </Text>
        </View>

        {error ? (
          <Animated.View 
            entering={FadeInUp.springify()}
            style={[styles.errorContainer, { backgroundColor: theme.error + '20' }]}
          >
            <AlertCircle size={16} color={theme.error} />
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          </Animated.View>
        ) : null}

        {renderAuthInput()}

        {securitySettings?.biometricEnabled && biometricAvailable && Platform.OS !== 'web' && (
          <Animated.View entering={FadeInUp.delay(400).springify()}>
            <TouchableOpacity
              style={[styles.biometricButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={handleBiometricAuth}
              disabled={isLoading}
            >
              <Fingerprint size={24} color={theme.primary} />
              <Text style={[styles.biometricText, { color: theme.primary }]}>
                Use Biometric Authentication
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  authButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  patternContainer: {
    alignItems: 'center',
    gap: 24,
  },
  patternGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 200,
    height: 200,
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  patternDot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternDotInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  clearButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    marginTop: 24,
    gap: 12,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '500',
  },
});