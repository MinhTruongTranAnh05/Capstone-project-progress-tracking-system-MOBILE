import Constants from 'expo-constants';

const DEFAULT_API_URL =
  'https://capstone-project-progress-tracking-system-be-production-afa9.up.railway.app/api/v1';

const getBaseUrl = (): string => {
  // 1. Environment variable (.env)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Expo app.json extra config
  if (Constants.expoConfig?.extra?.API_URL) {
    return Constants.expoConfig.extra.API_URL;
  }

  // 3. Fallback to deployed Railway API
  return DEFAULT_API_URL;
};

const API_URL = getBaseUrl();

export const config = {
  API_URL,
  API_TIMEOUT: 15000,
};


