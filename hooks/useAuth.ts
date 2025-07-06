import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { storageService } from '@/utils/storage';
import { SecuritySettings } from '@/types/diary';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    initializeAuth();
    checkBiometricAvailability();
  }, []);

  const initializeAuth = async () => {
    try {
      const settings = await storageService.getSecuritySettings();
      setSecuritySettings(settings);

      if (!settings?.isEnabled) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Check if auto-lock timeout has passed
      const lastActivity = await storageService.getLastActivity();
      if (lastActivity) {
        const timeDiff = Date.now() - lastActivity;
        const timeoutMs = settings.autoLockTimeout * 60 * 1000;
        
        if (timeDiff < timeoutMs) {
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkBiometricAvailability = async () => {
    if (Platform.OS === 'web') {
      setBiometricAvailable(false);
      return;
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasHardware && isEnrolled);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setBiometricAvailable(false);
    }
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    if (Platform.OS === 'web' || !biometricAvailable) {
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your diary',
        fallbackLabel: 'Use PIN instead',
        cancelLabel: 'Cancel',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  };

  const authenticateWithCredentials = async (
    authType: 'pin' | 'password' | 'pattern',
    input: string | number[]
  ): Promise<boolean> => {
    if (!securitySettings) return false;

    try {
      switch (authType) {
        case 'pin':
          return securitySettings.pin === input;
        case 'password':
          return securitySettings.password === input;
        case 'pattern':
          return JSON.stringify(securitySettings.pattern) === JSON.stringify(input);
        default:
          return false;
      }
    } catch (error) {
      console.error('Credential authentication error:', error);
      return false;
    }
  };

  const login = async () => {
    setIsAuthenticated(true);
    await storageService.updateLastActivity();
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const setupSecurity = async (settings: SecuritySettings) => {
    try {
      await storageService.saveSecuritySettings(settings);
      setSecuritySettings(settings);
      
      if (settings.isEnabled) {
        await storageService.updateLastActivity();
      }
    } catch (error) {
      console.error('Error setting up security:', error);
      throw error;
    }
  };

  const disableSecurity = async () => {
    try {
      await storageService.clearSecurityData();
      setSecuritySettings(null);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error disabling security:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    isLoading,
    securitySettings,
    biometricAvailable,
    authenticateWithBiometric,
    authenticateWithCredentials,
    login,
    logout,
    setupSecurity,
    disableSecurity,
    updateLastActivity: storageService.updateLastActivity,
  };
}