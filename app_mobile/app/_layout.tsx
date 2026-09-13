import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores/auth.store';

const queryClient = new QueryClient();

function AuthGate() {
  const { isAuthenticated, hydrate } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrate().finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    // Wait until hydrate() finished AND the router has resolved the initial segment.
    // segments is [] before the navigator mounts, so this prevents the
    // "navigate before Root Layout mounted" crash.
    if (!hydrated || !segments.length) return;

    const inAuth = (segments[0] as string) === '(auth)';
    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/welcome' as any);
    } else if (isAuthenticated && inAuth) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, hydrated]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGate />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="meal-detail" />
          <Stack.Screen name="add-food" />
          <Stack.Screen name="food-detail" />
          <Stack.Screen name="post-detail" />
          <Stack.Screen name="create-post" />
          <Stack.Screen name="user-profile" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="reco-detail" />
          <Stack.Screen name="add-weight" options={{ presentation: 'modal' }} />
          <Stack.Screen name="settings" />
          <Stack.Screen name="edit-profile" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
