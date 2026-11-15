import { Platform } from 'react-native';

// Dark & premium: deep ink background, warm gold as the single hero accent,
// a soft violet as the quiet secondary accent.
export const colors = {
  bg: '#07090F',
  bgSoft: '#0B0E17',
  surface: '#10141F',
  surface2: '#171C2B',
  border: '#232A3D',
  borderSoft: '#1A2031',
  gold: '#E3B764',
  goldLight: '#F5DC9C',
  goldDeep: '#B8873A',
  violet: '#8B7CF6',
  violetSoft: '#2A2550',
  text: '#F3EFE7',
  textSoft: '#C4C8D4',
  muted: '#8990A4',
  faint: '#555C70',
  success: '#5ED3A2',
  danger: '#F0736A',
  white: '#FFFFFF',
  black: '#000000',
};

export const goldGradient = ['#F5DC9C', '#E3B764', '#B8873A'] as const;
export const inkGradient = ['#161B2B', '#0D111B'] as const;

export const fonts = {
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia, "Times New Roman", serif',
  }) as string,
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'ui-monospace, Menlo, Consolas, monospace',
  }) as string,
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 10, md: 16, lg: 22, pill: 999 };
