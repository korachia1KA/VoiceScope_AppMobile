// src/theme/index.ts

export const colors = {
  // Brand — inspiration studio audio premium
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',  // main
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  accent: {
    coral: '#EF7258',
    lime: '#B8D96B',
    cyan: '#22D3EE',
    violet: '#5146D8',
  },
  // Sémantique
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  
  // Surfaces (light mode dominant — plus "enterprise")
  background: '#FBFAFF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#F8F7FC',
  
  // Texte
  textPrimary: '#18213A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  
  // Bordures
  border: '#E8E3F3',
  borderStrong: '#D4CCE8',
  
  // Overlays
  overlay: 'rgba(24, 33, 58, 0.5)',
  scrim: 'rgba(24, 33, 58, 0.08)',
  
  // Charts
  chart: {
    line: '#6366F1',
    lineAlt: '#22D3EE',
    bar: '#818CF8',
    grid: '#E8E3F3',
  },
} as const;

export const gradients = {
  hero: ['#26245F', '#5146D8', '#EF7258'] as const,
  primary: ['#5146D8', '#7469EE'] as const,
  sidebar: ['#171D3B', '#25205A', '#3A2461'] as const,
  coralLime: ['#FFF1ED', '#F0EDFF'] as const,
  success: ['#10B981', '#34D399'] as const,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  '2xl': 32,
  full: 9999,
} as const;

export const typography = {
  // Display — pour les KPIs et titres de hero
  display: {
    fontFamily: 'Inter-Bold',
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -1,
    fontWeight: '700' as const,
  },
  h1: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.8,
    fontWeight: '700' as const,
  },
  h2: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.5,
    fontWeight: '600' as const,
  },
  h3: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.3,
    fontWeight: '600' as const,
  },
  bodyLg: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySm: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    fontWeight: '600' as const,
  },
  caption: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    fontWeight: '500' as const,
  },
  mono: {
    fontFamily: 'Menlo',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#39306D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#39306D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#39306D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
  },
  brand: {
    shadowColor: '#EF7258',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

export const theme = {
  colors,
  gradients,
  spacing,
  radius,
  typography,
  shadows,
  dark: {
    background: '#0B1120',
    surface: '#172238',
    surfaceElevated: '#1E2A45',
    textPrimary: '#EDF2FF',
    textSecondary: '#A6B4CB',
    border: '#29364C',
  },
} as const;

export type Theme = typeof theme;