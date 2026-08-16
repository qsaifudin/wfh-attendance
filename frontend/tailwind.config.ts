import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'media',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--color-brand-primary)',
          accent: 'var(--color-brand-accent)',
          'accent-on-light': 'var(--color-brand-accent-on-light)',
        },
        surface: {
          plane: 'var(--color-surface-plane)',
          card: 'var(--color-surface-card)',
        },
        ink: {
          primary: 'var(--color-ink-primary)',
          secondary: 'var(--color-ink-secondary)',
          muted: 'var(--color-ink-muted)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
        },
        status: {
          present: 'var(--color-status-present)',
          late: 'var(--color-status-late)',
          absent: 'var(--color-status-absent)',
          inactive: 'var(--color-status-inactive)',
        },
        dept: {
          1: 'var(--color-dept-1)',
          2: 'var(--color-dept-2)',
          3: 'var(--color-dept-3)',
          4: 'var(--color-dept-4)',
        },
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
      },
    },
  },
  plugins: [],
};

export default config;
