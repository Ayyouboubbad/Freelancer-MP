/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        // Brand palette — deep violet / indigo
        brand: {
          50:  '#f0f0ff',
          100: '#e0e0fe',
          200: '#c4c4fd',
          300: '#a3a1fb',
          400: '#8279f6',
          500: '#6654ef',
          600: '#5a43e3',
          700: '#4c33c8',
          800: '#3e2aa2',
          900: '#342581',
          950: '#1e1554',
        },
        // Amber accent
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        // Surface colours for dark mode
        surface: {
          900: '#0d0d1a',
          800: '#13132a',
          700: '#1c1c38',
          600: '#252548',
          500: '#2e2e58',
        },
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #13132a 0%, #1c1c38 50%, #252548 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'gradient-brand': 'linear-gradient(135deg, #5a43e3 0%, #8279f6 100%)',
      },
      boxShadow: {
        'glow':      '0 0 20px rgba(102, 84, 239, 0.3)',
        'glow-lg':   '0 0 40px rgba(102, 84, 239, 0.4)',
        'card':      '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':'0 8px 40px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-up':   'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'scale-in':   'scaleIn 0.3s ease forwards',
        'pulse-slow': 'pulse 3s infinite',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
