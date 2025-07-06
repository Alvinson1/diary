import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Switch,
  Platform 
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { 
  Lock, 
  Key, 
  Grid3x3, 
  Fingerprint, 
  Clock, 
  Shield,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react-native';
import { SecuritySettings } from '@/types/diary';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface SecuritySetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function SecuritySetup({ onComplete, onCancel }: SecuritySetupProps) {
  const { theme } = useTheme();
  const { setupSecurity, biometricAvailable } = useAuth();

  const [step, setStep] = useState(1);
  const [authType, setAuthType] = useState<'pin' | 'password' | 'pattern'>('pin');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pattern, setPattern] = useState<number[]>([]);
  const [confirmPattern, setConfirmPattern] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockTimeout, setAutoLockTimeout] = useState(5);
  const [isPatternConfirm, setIsPatternConfirm] = useState(false);

  const authOptions = [
    { 
      type: 'pin' as const, 
      title: 'PIN', 
      description: '4-6 digit numeric code',
      icon: Key 
    },
    { 
      type: 'password' as const, 
      title: 'Password', 
      description: 'Alphanumeric password',
      icon: Lock 
    },
    { 
      type: 'pattern' as const, 
      title: 'Pattern', 
      description: 'Connect dots to create pattern',
      icon: Grid3x3 
    },
  ];

  const timeoutOptions = [
    { value: 1, label: '1 minute' },
    { value: 5, label: '5 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
  ];

  const handlePatternDot = (index: number) => {
    const currentPattern = isPatternConfirm ? confirmPattern : pattern;
    
    if (currentPattern.includes(index)) return;
    
    const newPattern = [...currentPattern, index];
    
    if (isPatternConfirm) {
      setConfirmPattern(newPattern);
    } else {
      setPattern(newPattern);
    }
    
    if (newPattern.length >= 4) {
      setTimeout(() => {
        if (isPatternConfirm) {
          // Pattern confirmation complete
        } else {
          // Move to confirmation
          setIsPatternConfirm(true);
        }
      }, 300);
    }
  };

  const clearPattern = () => {
    if (isPatternConfirm) {
      setConfirmPattern([]);
    } else {
      setPattern([]);
    }
  };

  const validateCredentials = () => {
    switch (authType) {
      case 'pin':
        return pin.length >= 4 && pin === confirmPin;
      case 'password':
        return password.length >= 6 && password === confirmPassword;
      case 'pattern':
        return pattern.length >= 4 && JSON.stringify(pattern) === JSON.stringify(confirmPattern);
      default:
        return false;
    }
  };

  const handleComplete = async () => {
    if (!validateCredentials()) return;

    const settings: SecuritySettings = {
      isEnabled: true,
      authType,
      biometricEnabled: biometricEnabled && biometricAvailable,
      autoLockTimeout,
    };

    switch (authType) {
      case 'pin':
        settings.pin = pin;
        break;
      case 'password':
        settings.password = password;
        break;
      case 'pattern':
        settings.pattern = pattern;
        break;
    }

    try {
      await setupSecurity(settings);
      onComplete();
    } catch (error) {
      console.error('Error setting up security:', error);
    }
  };

  const renderStep1 = () => (
    <Animated.View entering={FadeInDown.springify()}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Choose Authentication Method</Text>
      <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
        Select how you want to secure your diary
      </Text>

      <View style={styles.optionsContainer}>
        {authOptions.map((option) => (
          <TouchableOpacity
            key={option.type}
            style={[
              styles.optionCard,
              { 
                backgroundColor: theme.surface,
                borderColor: authType === option.type ? theme.primary : theme.border,
                borderWidth: authType === option.type ? 2 : 1,
              }
            ]}
            onPress={() => setAuthType(option.type)}
          >
            <option.icon 
              size={24} 
              color={authType === option.type ? theme.primary : theme.textSecondary} 
            />
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>
                {option.title}
              </Text>
              <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                {option.description}
              </Text>
            </View>
            {authType === option.type && (
              <Check size={20} color={theme.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View entering={FadeInDown.springify()}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>
        Set Your {authType.charAt(0).toUpperCase() + authType.slice(1)}
      </Text>
      
      {authType === 'pin' && (
        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Key size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.textInput, { color: theme.text }]}
              value={pin}
              onChangeText={setPin}
              placeholder="Enter 4-6 digit PIN"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
            />
          </View>
          
          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Key size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.textInput, { color: theme.text }]}
              value={confirmPin}
              onChangeText={setConfirmPin}
              placeholder="Confirm PIN"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
            />
          </View>
        </View>
      )}

      {authType === 'password' && (
        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Lock size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.textInput, { color: theme.text }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password (min 6 characters)"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color={theme.textSecondary} />
              ) : (
                <Eye size={20} color={theme.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Lock size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.textInput, { color: theme.text }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? (
                <EyeOff size={20} color={theme.textSecondary} />
              ) : (
                <Eye size={20} color={theme.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {authType === 'pattern' && (
        <View style={styles.patternContainer}>
          <Text style={[styles.patternInstruction, { color: theme.textSecondary }]}>
            {isPatternConfirm ? 'Confirm your pattern' : 'Draw your unlock pattern (min 4 dots)'}
          </Text>
          
          <View style={styles.patternGrid}>
            {Array.from({ length: 9 }, (_, index) => {
              const currentPattern = isPatternConfirm ? confirmPattern : pattern;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.patternDot,
                    { 
                      backgroundColor: currentPattern.includes(index) ? theme.primary : theme.surface,
                      borderColor: theme.border 
                    }
                  ]}
                  onPress={() => handlePatternDot(index)}
                >
                  {currentPattern.includes(index) && (
                    <View style={[styles.patternDotInner, { backgroundColor: theme.background }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: theme.surface }]}
            onPress={clearPattern}
          >
            <Text style={[styles.clearButtonText, { color: theme.textSecondary }]}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View entering={FadeInDown.springify()}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Additional Settings</Text>
      
      <View style={styles.settingsContainer}>
        {biometricAvailable && Platform.OS !== 'web' && (
          <View style={[styles.settingItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.settingLeft}>
              <Fingerprint size={24} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Biometric Authentication</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  Use fingerprint or face recognition
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={biometricEnabled ? '#FFFFFF' : theme.textSecondary}
            />
          </View>
        )}

        <View style={[styles.settingItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.settingLeft}>
            <Clock size={24} color={theme.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Auto-lock Timeout</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Lock app after inactivity
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.timeoutOptions}>
          {timeoutOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.timeoutOption,
                { 
                  backgroundColor: autoLockTimeout === option.value ? theme.primary + '20' : theme.surface,
                  borderColor: autoLockTimeout === option.value ? theme.primary : theme.border,
                }
              ]}
              onPress={() => setAutoLockTimeout(option.value)}
            >
              <Text style={[
                styles.timeoutText,
                { color: autoLockTimeout === option.value ? theme.primary : theme.text }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.springify()} style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
            <Shield size={32} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Setup Security</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Protect your diary with secure authentication
          </Text>
        </Animated.View>

        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((stepNumber) => (
            <View
              key={stepNumber}
              style={[
                styles.stepDot,
                { 
                  backgroundColor: step >= stepNumber ? theme.primary : theme.border,
                }
              ]}
            />
          ))}
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <Animated.View 
        entering={FadeInUp.delay(300).springify()}
        style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}
      >
        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: theme.surface }]}
          onPress={step === 1 ? onCancel : () => setStep(step - 1)}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            { 
              backgroundColor: theme.primary,
              opacity: (step === 2 && !validateCredentials()) ? 0.5 : 1
            }
          ]}
          onPress={step === 3 ? handleComplete : () => setStep(step + 1)}
          disabled={step === 2 && !validateCredentials()}
        >
          <Text style={styles.primaryButtonText}>
            {step === 3 ? 'Complete Setup' : 'Next'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
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
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
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
  patternContainer: {
    alignItems: 'center',
    gap: 24,
  },
  patternInstruction: {
    fontSize: 16,
    textAlign: 'center',
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
  settingsContainer: {
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  timeoutOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  timeoutOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  timeoutText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});