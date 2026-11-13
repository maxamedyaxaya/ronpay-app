/**
 * RoonPay design tokens (CLAUDE.md §7).
 * Used by tailwind.config.js and lib/theme.ts.
 * Screens use the token NAMES (bg-surface, text-ink, …), never hex codes.
 *
 * `colors` replaces Tailwind's default palette on purpose, so only these tokens exist.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',

      bg: '#070B18',
      surface: '#0E1630',
      border: '#1F2A4A',
      ink: '#EEF2FF',
      muted: '#8E9AC0',

      primary: '#2563EB',
      blue: '#3B82F6',
      violet: '#8B5CF6',
      success: '#34D399',
      gold: '#F5C451',
      danger: '#FCA5A5',

      tier: {
        bronze: '#D08A4E',
        silver: '#C3CBDB',
        gold: '#F5C451',
        platinum: '#7DD3FC',
        diamond: '#60A5FA',
        royal: '#B794FF',
      },
    },
    extend: {
      // React Native needs one font family per weight. The first name is the
      // expo-font name (mobile); the rest are web fallbacks (admin).
      fontFamily: {
        sans: ['PlusJakartaSans_400Regular', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        'sans-medium': ['PlusJakartaSans_500Medium', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        'sans-semibold': ['PlusJakartaSans_600SemiBold', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        'sans-bold': ['PlusJakartaSans_700Bold', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        'sans-extrabold': ['PlusJakartaSans_800ExtraBold', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrainsMono_400Regular', 'JetBrains Mono', 'ui-monospace', 'monospace'],
        'mono-bold': ['JetBrainsMono_700Bold', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      // Corner radius 14–24 px.
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
        '3xl': '24px',
      },
      // Touch targets are at least 44×44.
      minHeight: { touch: '44px' },
      minWidth: { touch: '44px' },
    },
  },
};
