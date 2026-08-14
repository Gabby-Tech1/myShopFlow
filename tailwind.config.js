/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // MyShopFlow brand tokens (spec §2)
        canary: {
          DEFAULT: '#F4B400',
          50: '#FEF9E7',
          100: '#FDF0C4',
          200: '#FBE28A',
          300: '#F9D250',
          400: '#F6C22B',
          500: '#F4B400',
          600: '#C99400',
          700: '#9B7200',
        },
        brick: {
          DEFAULT: '#E0551A',
          50: '#FDF0EA',
          100: '#FADAC9',
          200: '#F3AE8C',
          300: '#EC824F',
          400: '#E66A34',
          500: '#E0551A',
          600: '#B84415',
          700: '#8A3310',
        },
        ink: {
          DEFAULT: '#1A1D23',
          soft: '#6B7280',
          faint: '#9AA1AD',
        },
        paper: '#FFFFFF',
        canvas: '#F4F5F7',
        hair: '#E2E5EA',
        line: '#EAECF0',
        sidebar: {
          DEFAULT: '#111827',
          soft: '#1B2433',
          line: '#293345',
          muted: '#98A2B3',
        },
        // Semantic (always paired with icon+label, never color-only)
        inflow: '#0E9F6E',
        outflow: '#E0551A',
        info: '#2563EB',
        warn: '#D97706',
        danger: '#DC2626',
      },
      fontFamily: {
        sans: [
          'Manrope',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Segoe UI"',
          'system-ui',
          'sans-serif',
        ],
      },
      letterSpacing: {
        tightest: '-0.03em',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        lg: '0.625rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.375rem',
      },
      boxShadow: {
        // Soft, diffused ambient depth — no harsh dark drop shadows.
        xs: '0 1px 2px rgba(18, 20, 26, 0.04)',
        card: '0 1px 2px rgba(16, 24, 40, 0.03), 0 8px 24px -14px rgba(16, 24, 40, 0.14)',
        'card-hover': '0 2px 6px rgba(16, 24, 40, 0.05), 0 20px 40px -18px rgba(16, 24, 40, 0.20)',
        pop: '0 12px 48px -12px rgba(18, 20, 26, 0.22)',
        canary: '0 6px 18px -6px rgba(244, 180, 0, 0.45)',
        'inset-hair': 'inset 0 0 0 1px rgba(18, 20, 26, 0.06)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.32, 0.72, 0, 1)',
        smooth: 'cubic-bezier(0.4, 0.14, 0.3, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s cubic-bezier(0.32,0.72,0,1) both',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.32,0.72,0,1) both',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}
