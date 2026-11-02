const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('./testHarness.cjs');
const { checkGoogleConfig } = require('./check-google-config.cjs');

// Representative public identifiers; these are never real user tokens or secrets.
const iosId = '123456789-ios.apps.googleusercontent.com';
const webId = '123456789-server.apps.googleusercontent.com';

test('native Google availability distinguishes Expo Go from a configured iOS development build', () => {
  const { nativeGoogleUnavailableReason } = createHarness().load('src/features/auth/domain/google.ts');
  assert.match(nativeGoogleUnavailableReason(true, 'ios', iosId), /Expo Go/);
  assert.match(nativeGoogleUnavailableReason(false, 'ios', ''), /chưa được cấu hình/);
  assert.equal(nativeGoogleUnavailableReason(false, 'ios', iosId), null);
  assert.equal(nativeGoogleUnavailableReason(false, 'android'), null);
});

function client(response = { type: 'success', data: { idToken: 'test-id-token' } }) {
  const calls = [];
  return { calls,
    configure: options => calls.push(['configure', options]),
    hasPreviousSignIn: () => true,
    hasPlayServices: async options => { calls.push(['playServices', options]); return true; },
    signOut: async () => { calls.push(['signOut']); },
    signIn: async () => { calls.push(['signIn']); return response; },
  };
}
test('native Google uses the separate server/iOS IDs and selects an account again', async () => {
  const { getNativeGoogleCredential } = createHarness().load('src/features/auth/data/nativeGoogle.ts');
  const google = client();
  const token = await getNativeGoogleCredential(google, { platform: 'ios', webClientId: webId, iosClientId: iosId });
  assert.equal(token, 'test-id-token');
  assert.deepEqual(google.calls, [
    ['configure', { webClientId: webId, iosClientId: iosId, offlineAccess: false }], ['signOut'], ['signIn'],
  ]);
});
test('Google cancellation yields no credential and missing tokens fail instead of authenticating', async () => {
  const { getNativeGoogleCredential } = createHarness().load('src/features/auth/data/nativeGoogle.ts');
  const options = { platform: 'ios', webClientId: webId, iosClientId: iosId };
  assert.equal(await getNativeGoogleCredential(client({ type: 'cancelled', data: null }), options), null);
  await assert.rejects(getNativeGoogleCredential(client({ type: 'success', data: { idToken: null } }), options), /Google không trả về mã xác thực/);
  const google = client();
  await assert.rejects(getNativeGoogleCredential(google, { ...options, webClientId: '' }), /Web Client ID/);
  assert.equal(google.calls.length, 0);
});
test('Android checks Play Services before signing in and propagates provider failures', async () => {
  const { getNativeGoogleCredential } = createHarness().load('src/features/auth/data/nativeGoogle.ts');
  const google = client();
  const denied = new Error('DEVELOPER_ERROR');
  google.hasPlayServices = async () => { throw denied; };
  await assert.rejects(getNativeGoogleCredential(google, { platform: 'android', webClientId: webId }), error => error === denied);
  assert.equal(google.calls.some(call => call[0] === 'signIn'), false);
});
test('native preflight rejects missing cloud environment and incorrect reversed iOS scheme', () => {
  const environment = { EXPO_PUBLIC_API_URL: 'https://api.example.test/api/v1', EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: webId, EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: iosId };
  const app = { ios: { bundleIdentifier: 'com.fpt.capstone.mobile' }, plugins: [['@react-native-google-signin/google-signin', { iosUrlScheme: 'com.googleusercontent.apps.123456789-ios' }]] };
  assert.deepEqual(checkGoogleConfig(environment, app, 'ios'), []);
  assert.ok(checkGoogleConfig({}, app, 'ios').length >= 3);
  assert.ok(checkGoogleConfig(environment, { ...app, plugins: [] }, 'ios').some(error => error.includes('reversed')));
  assert.ok(checkGoogleConfig({ ...environment, EXPO_PUBLIC_API_URL: 'https://api.example.test/api/v1?token=test' }, app, 'ios').some(error => error.includes('API_URL')));
});
test('Expo config derives the iOS callback scheme from the supplied iOS ID and rejects malformed values', t => {
  const previous = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  t.after(() => { if (previous === undefined) delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID; else process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = previous; });
  const configure = require('../app.config.js');
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = iosId;
  const configured = configure({ config: { plugins: ['expo-router'], ios: { bundleIdentifier: 'com.fpt.capstone.mobile' } } });
  assert.equal(configured.plugins[1][1].iosUrlScheme, 'com.googleusercontent.apps.123456789-ios');
  assert.equal(configured.ios.bundleIdentifier, 'com.fpt.capstone.mobile');
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = 'not-a-client-id';
  assert.throws(() => configure({ config: {} }), /iOS OAuth Client ID/);
});
