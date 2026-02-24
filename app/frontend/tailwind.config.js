export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: '#B2AC88',
        slateSoft: '#44515E',
        paper: '#F7F8F3',
      },
      boxShadow: {
        card: '0 14px 30px rgba(43, 56, 69, 0.08)',
      },
      keyframes: {
        scan: {
          '0%, 100%': { top: '8%' },
          '50%': { top: '86%' },
        },
        fadeSlide: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        scan: 'scan 2s ease-in-out infinite',
        fadeSlide: 'fadeSlide 450ms ease-out',
      },
      fontFamily: {
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
