const { getConfig } = require('expo/config');

function checkGoogleConfig(environment, app, platform) {
  const errors = [];
  const clientIdPattern = /^\d+-[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/;
  if (!['ios', 'android', 'web'].includes(platform)) errors.push('Platform must be ios, android or web.');
  try {
    const url = new URL(environment.EXPO_PUBLIC_API_URL);
    if (!['http:', 'https:'].includes(url.protocol) || !url.pathname.replace(/\/$/, '').endsWith('/api/v1') || url.search || url.hash || url.username || url.password) {
      throw new Error('Invalid API URL');
    }
  } catch { errors.push('Set EXPO_PUBLIC_API_URL to the current BE URL ending in /api/v1.'); }
  const serverClientKey = platform === 'web' ? 'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID' : 'EXPO_PUBLIC_GOOGLE_MOBILE_WEB_CLIENT_ID';
  if (!clientIdPattern.test(environment[serverClientKey] ?? '')) {
    errors.push(`Set ${serverClientKey} to the BE-supplied Web OAuth Client ID for this platform.`);
  }
  if (platform === 'ios') {
    const clientId = environment.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    if (!clientIdPattern.test(clientId ?? '')) errors.push('Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID to the iOS OAuth Client ID.');
    if (!app.ios?.bundleIdentifier) errors.push('Set ios.bundleIdentifier in the Expo config.');
    const expectedScheme = clientId ? `com.googleusercontent.apps.${clientId.replace('.apps.googleusercontent.com', '')}` : null;
    const plugin = app.plugins?.find(entry => Array.isArray(entry) && entry[0] === '@react-native-google-signin/google-signin');
    if (!expectedScheme || plugin?.[1]?.iosUrlScheme !== expectedScheme) errors.push('Configure the Google plugin with the reversed iOS Client ID.');
  }
  if (platform === 'android' && !app.android?.package) errors.push('Set android.package in the Expo config.');
  return errors;
}

if (require.main === module) {
  // Local scripts load .env with Node; EAS supplies its selected environment directly.
  const platform = process.env.EAS_BUILD_PLATFORM || process.argv[2] || 'ios';
  try {
    const errors = checkGoogleConfig(process.env, getConfig(process.cwd()).exp, platform);
    if (errors.length) throw new Error(errors.join('\n'));
    process.stdout.write(`Local Google ${platform} configuration is present. BE reachability, allowed audiences, Google client type, signing and device login still need verification.\n`);
  } catch (error) {
    process.stderr.write((error instanceof Error ? error.message : 'Google configuration check failed.') + '\n');
    process.exitCode = 1;
  }
}
module.exports = { checkGoogleConfig };
