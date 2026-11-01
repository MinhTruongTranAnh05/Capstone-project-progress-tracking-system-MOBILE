import { StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

export const authStyles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 32, height: 32, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 6px rgba(230,81,0,0.18)' },
  logoText: { color: colors.textLight, fontSize: 20, fontWeight: '800' },
  brand: { color: colors.authText, fontSize: 14, fontWeight: '900', letterSpacing: -0.2 },
  heading: { color: colors.authText, fontSize: 26, lineHeight: 32, fontWeight: '900', letterSpacing: -0.8 },
  body: { color: colors.authBody, fontSize: 12, lineHeight: 19 },
  label: { color: colors.authText, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  input: { backgroundColor: colors.authField, borderWidth: 1, borderColor: colors.authBorder, borderRadius: 12, minHeight: 48, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: colors.authText },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 12, minHeight: 48, padding: 12, alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 6px rgba(230,81,0,0.15)' },
  primaryButtonText: { color: colors.textLight, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  separator: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  separatorLine: { flex: 1, height: 1, backgroundColor: colors.authBorder },
  separatorText: { color: colors.authText, fontSize: 12, fontWeight: '600' },
  footnote: { color: colors.authBody, fontSize: 11, lineHeight: 17 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.authBorder, paddingTop: 12, gap: 8 },
  footerText: { color: colors.authText, fontSize: 10, lineHeight: 16 },
});
