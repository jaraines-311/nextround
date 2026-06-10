import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand palette (dark navy + vivid blue)
        plum: {
          50:   '#eff6ff',   // light tint — selected card backgrounds
          100:  '#dbeafe',   // badge backgrounds
          200:  '#bfdbfe',   // border tints
          300:  '#93c5fd',   // text on dark backgrounds
          400:  '#60a5fa',   // sidebar accents, focus rings
          500:  '#3b82f6',
          600:  '#2563eb',   // icon color
          700:  '#1d4ed8',
          800:  '#1e40af',
          900:  '#1559C0',   // PRIMARY: vivid royal blue — buttons, links, selected states
          950:  '#1040A0',
          dark: '#124FB0',   // hover / deeper variant
        },
        // Neutral grays — warm, not cold
        neutral: {
          0:   '#ffffff',
          50:  '#f8f8f8',
          100: '#f0f0f0',
          200: '#e8e8e8',
          300: '#d6d6d6',
          400: '#b4b4b4',
          500: '#868686',
          600: '#616061',
          700: '#454245',
          800: '#2d2d2d',
          900: '#1D1C1D',
          950: '#121112',
        },
        // Secondary accent (calm blue)
        sky: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#1264A3', // Slack blue
          700: '#0f4f85',
        },
        // Semantic
        success: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#007a5a', // Slack green
          700: '#15803d',
        },
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#ECB22E', // Slack yellow
          700: '#b45309',
        },
        danger: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          500: '#ef4444',
          600: '#E01E5A', // Slack red
          700: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        xs:   ['0.75rem',  { lineHeight: '1rem' }],
        sm:   ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem',     { lineHeight: '1.5rem' }],
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],
        xl:   ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl':['1.5rem',   { lineHeight: '2rem' }],
        '3xl':['1.875rem', { lineHeight: '2.25rem' }],
        '4xl':['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl':['3rem',     { lineHeight: '1.16' }],
        '6xl':['3.75rem',  { lineHeight: '1.1' }],
      },
      borderRadius: {
        sm:   '4px',
        DEFAULT: '6px',
        md:   '8px',
        lg:   '10px',
        xl:   '14px',
        '2xl':'18px',
        '3xl':'24px',
        full: '9999px',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        72: '18rem',
        84: '21rem',
        96: '24rem',
      },
      boxShadow: {
        'xs':  '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'sm':  '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        DEFAULT: '0 2px 6px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'md':  '0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'lg':  '0 10px 24px -4px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.04)',
        'xl':  '0 20px 40px -8px rgb(0 0 0 / 0.10), 0 8px 16px -8px rgb(0 0 0 / 0.06)',
        'inner-sm': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      keyframes: {
        'fade-in':    { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-up':    { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in':   { from: { opacity: '0', transform: 'translateX(-8px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        'scale-in':   { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'pulse-soft': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        'recording':  { '0%, 100%': { transform: 'scale(1)', opacity: '1' }, '50%': { transform: 'scale(1.08)', opacity: '0.8' } },
      },
      animation: {
        'fade-in':    'fade-in 0.25s ease-out',
        'fade-up':    'fade-up 0.35s ease-out',
        'slide-in':   'slide-in 0.2s ease-out',
        'scale-in':   'scale-in 0.2s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'recording':  'recording 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
