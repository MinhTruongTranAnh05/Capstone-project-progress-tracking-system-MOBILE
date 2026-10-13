const getBaseUrl = (): string => {
  // Read from environment variable (.env / EAS Environment Variables)
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      'Thiếu EXPO_PUBLIC_API_URL. Hãy copy .env.example thành .env và điền URL backend.'
    );
  }
  return url;
};

const API_URL = getBaseUrl();

export const config = {
  API_URL,
  API_TIMEOUT: 15000,
};
