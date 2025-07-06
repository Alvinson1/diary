import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { AuthScreen } from '@/components/AuthScreen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isLoading: themeLoading } = useTheme();

  useEffect(() => {
    if ((fontsLoaded || fontError) && !authLoading && !themeLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, authLoading, themeLoading]);

  if ((!fontsLoaded && !fontError) || authLoading || themeLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen />
        <StatusBar 
          style="auto" 
          backgroundColor="transparent"
          translucent={Platform.OS === 'android'}
        />
      </>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="entry/[id]" />
        <Stack.Screen name="create" />
        <Stack.Screen name="security" />
        <Stack.Screen name="timeline/[date]" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar 
        style="auto" 
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
    </>
  );
}