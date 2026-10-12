import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://10.0.2.2:8080/api/v1';

export const config = {
  API_URL,
  API_TIMEOUT: 30000,
};
