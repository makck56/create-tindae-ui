/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
          disabled: 'var(--color-primary-disabled)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          hover: 'var(--color-success-hover)',
          active: 'var(--color-success-active)',
          disabled: 'var(--color-success-disabled)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          hover: 'var(--color-danger-hover)',
          active: 'var(--color-danger-active)',
          disabled: 'var(--color-danger-disabled)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          hover: 'var(--color-warning-hover)',
          active: 'var(--color-warning-active)',
          disabled: 'var(--color-warning-disabled)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          hover: 'var(--color-info-hover)',
          active: 'var(--color-info-active)',
          disabled: 'var(--color-info-disabled)',
        },
      },
      textColor: {
        title: 'var(--text-title)',
        body: 'var(--text-body)',
        secondary: 'var(--text-secondary)',
        disabled: 'var(--text-disabled)',
      },
      backgroundColor: {
        white: 'var(--bg-white)',
        page: 'var(--bg-page)',
      },
      spacing: Object.fromEntries(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96]
          .map(k => [String(k), `${k * 4}px`])
      ),
      fontSize: {
        xs: ['12px', { lineHeight: '20px' }],
        sm: ['14px', { lineHeight: '22px' }],
        tiny: ['16px', { lineHeight: '24px' }],
        base: ['18px', { lineHeight: '28px' }],
        lg: ['20px', { lineHeight: '28px' }],
        xl: ['24px', { lineHeight: '32px' }],
        '2xl': ['28px', { lineHeight: '36px' }],
        '3xl': ['32px', { lineHeight: '40px' }],
        '4xl': ['36px', { lineHeight: '44px' }],
        '5xl': ['40px', { lineHeight: '48px' }],
      },
      borderColor: {
        base: 'var(--border-base)',
        light: 'var(--border-light)',
        lighter: 'var(--border-lighter)',
        'extra-light': 'var(--border-extra-light)',
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
    },
  },
  plugins: [],
}
