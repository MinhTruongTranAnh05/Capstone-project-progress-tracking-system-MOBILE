import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { colors } from '@/constants/colors';
import { requireOptionalNativeModule } from 'expo';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    // Hide the Expo Go floating gear/dev-menu button so it doesn't overlap content.
    // The DevMenuPreferences module only exists in Expo Go / dev builds,
    // so requireOptionalNativeModule returns null in production — safe to call.
    try {
      const DevMenuPreferences = requireOptionalNativeModule('DevMenuPreferences');
      if (DevMenuPreferences?.setPreferencesAsync) {
        DevMenuPreferences.setPreferencesAsync({
          showFloatingActionButton: false,
        });
      }
    } catch {
      // Module unavailable — no-op in production builds
    }
  }, []);

  return (
    // SafeAreaProvider must wrap the entire app so useSafeAreaInsets()
    // works correctly in every child screen.
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* translucent={false} keeps the status bar opaque; our
              ScreenHeader adds paddingTop = insets.top for each screen */}
          <StatusBar style="dark" translucent={false} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(groups)" options={{ headerShown: false }} />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
