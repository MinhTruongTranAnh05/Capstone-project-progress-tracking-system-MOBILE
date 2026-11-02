module.exports = ({ config }) => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
  if (iosClientId && !/^\d+-[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(iosClientId)) {
    throw new Error('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID must be an iOS OAuth Client ID ending in .apps.googleusercontent.com.');
  }
  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      ...(iosClientId
        ? [['@react-native-google-signin/google-signin', {
            iosUrlScheme: `com.googleusercontent.apps.${iosClientId.replace('.apps.googleusercontent.com', '')}`,
          }]]
        : []),
    ],
  };
};
