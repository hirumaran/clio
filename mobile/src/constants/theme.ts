/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// ---------------------------------------------------------------------------
// Semantic tokens — MVP 0 mobile design system
// ---------------------------------------------------------------------------

export const SemanticColors = {
  accent: '#6B1E2E',
  accentSoft: '#9e4a5c',
  gold: '#C9A84C',
  danger: '#b42318',
  success: '#1a7f37',
  warning: '#b35900',
} as const;

export const SurfaceColors = {
  light: {
    surface: '#F7F7F8',
    surfaceElevated: '#ffffff',
    border: '#E0E1E6',
    borderSubtle: '#F0F0F3',
    textPrimary: '#000000',
    textSecondary: '#60646C',
    textTertiary: '#8F9198',
    overlay: 'rgba(0,0,0,0.04)',
  },
  dark: {
    surface: '#16171A',
    surfaceElevated: '#212225',
    border: '#2E3135',
    borderSubtle: '#212225',
    textPrimary: '#ffffff',
    textSecondary: '#B0B4BA',
    textTertiary: '#6C6F76',
    overlay: 'rgba(255,255,255,0.04)',
  },
} as const;

export function useSurfaceColors(scheme: 'light' | 'dark') {
  return SurfaceColors[scheme];
}
