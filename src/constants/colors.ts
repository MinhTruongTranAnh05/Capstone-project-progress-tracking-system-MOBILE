export const colors = {
  // Brand Orange
  primary: '#E65100',
  primaryDark: '#D84315',
  primaryLight: '#FFF3E0',
  primary50: '#FFF7ED',
  primary100: '#FFEDD5',

  // Canvas & Surfaces
  background: '#FBF9F5',
  surface: '#FFFFFF',
  surfaceMuted: '#F8F6F0',
  cardGlass: 'rgba(255, 255, 255, 0.95)',
  overlayDark: 'rgba(44, 40, 37, 0.45)',
  authOverlay: 'rgba(255, 255, 255, 0.2)',
  authCard: 'rgba(255, 255, 255, 0.68)',
  authText: '#171717',
  authBody: '#404040',
  authField: '#FAFAFA',
  authBorder: 'rgba(229, 229, 229, 0.85)',

  // Text Hierarchy
  text: '#2C2825',
  textSecondary: '#6B635B',
  textMuted: '#9E958C',
  textLight: '#FFFFFF',

  // Borders & Dividers
  border: '#E8E2D9',
  borderLight: '#F0EBE1',
  borderSubtle: '#F5F2EC',
  borderWhite: 'rgba(255, 255, 255, 0.4)',

  // Status & Feedback - Success (Emerald)
  success: '#059669',
  successDark: '#047857',
  successLight: '#D1FAE5',
  success50: '#ECFDF5',
  successBorder: '#A7F3D0',

  // Status - Warning / Pending (Amber)
  warning: '#D97706',
  warningDark: '#B45309',
  warningLight: '#FEF3C7',
  warning50: '#FFFBEB',
  warningBorder: '#FDE68A',

  // Status - Error / Danger (Red)
  error: '#DC2626',
  errorDark: '#B91C1C',
  errorLight: '#FEE2E2',
  error50: '#FEF2F2',
  errorBorder: '#FECACA',

  // Accents
  blue: '#2563EB',
  blueLight: '#DBEAFE',
  blue50: '#EFF6FF',
  purple: '#9333EA',
  purpleLight: '#F3E8FF',

  // Neutral Grays
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E8E2D9',
    300: '#D6D3D1',
    400: '#9E958C',
    500: '#6B635B',
    600: '#4B4540',
    700: '#38332F',
    800: '#2C2825',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#2C2825',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#2C2825',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#2C2825',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};
