import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { SafeAreaRoot } from '@/core/ui/SafeAreaRoot';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SessionStatus } from '@/components/SessionStatus';
import { SessionError } from '@/services/apiError';
import { colors } from '@/constants/colors';
import { requireOptionalNativeModule } from 'expo';
import { FormationProvider } from '@/contexts/FormationContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) => count < 1 && !(error instanceof SessionError)
        && !(isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)),
      staleTime: 1000 * 60 * 5,
    },
  },
});

function RootNavigator() {
  const { isAuthenticated, isLoading, startupError } = useAuth();
  if (isLoading || startupError) return <SessionStatus />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(groups)" />
      </Stack.Protected>
    </Stack>
  );
}

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
    // Native uses measured insets; Web uses CSS insets with Router 58.
    <SafeAreaRoot>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FormationProvider>
          <StatusBar style="dark" />
          <RootNavigator />
          </FormationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaRoot>
  );
}
