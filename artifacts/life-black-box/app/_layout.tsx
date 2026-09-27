import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppProvider } from '@/context/AppContext';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Web previews can keep font loading pending while the bundle is hydrating.
  // Let the app render with the system fallback there; native keeps the splash
  // gate until Inter is ready.
  if (!fontsLoaded && !fontError && Platform.OS !== 'web') return null;

  return <SafeAreaProvider><ErrorBoundary><QueryClientProvider client={queryClient}><AppProvider><GestureHandlerRootView style={{ flex: 1 }}><KeyboardProvider><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /><Stack.Screen name="emergency" options={{ presentation: 'modal', animation: 'fade' }} /></Stack></KeyboardProvider></GestureHandlerRootView></AppProvider></QueryClientProvider></ErrorBoundary></SafeAreaProvider>;
}
