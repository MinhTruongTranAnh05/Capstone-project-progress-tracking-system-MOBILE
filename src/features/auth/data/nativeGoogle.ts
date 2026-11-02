type GoogleClient = Pick<typeof import('@react-native-google-signin/google-signin').GoogleSignin,
  'configure' | 'hasPlayServices' | 'hasPreviousSignIn' | 'signOut' | 'signIn'>;

// Returns only the credential required by the BE. Google profile data is not an app session.
export async function getNativeGoogleCredential(client: GoogleClient, options: {
  platform: string; webClientId: string; iosClientId?: string;
}): Promise<string | null> {
  if (!options.webClientId.trim()) throw new Error('Chưa cấu hình Google Web Client ID.');
  client.configure({ webClientId: options.webClientId, iosClientId: options.iosClientId, offlineAccess: false });
  if (options.platform === 'android') await client.hasPlayServices({ showPlayServicesUpdateDialog: true });
  // Offer account selection again after app logout or a denied backend login.
  if (client.hasPreviousSignIn()) await client.signOut();
  const result = await client.signIn();
  if (result.type === 'cancelled') return null;
  if (!result.data.idToken) throw new Error('Google không trả về mã xác thực. Vui lòng thử lại.');
  return result.data.idToken;
}
