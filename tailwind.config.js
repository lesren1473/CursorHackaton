/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'landing-hero': {
          '0%': {
            opacity: '0',
            filter: 'blur(10px)',
            transform: 'scale(0.9) translateY(14px)',
          },
          '60%': {
            opacity: '1',
            filter: 'blur(0)',
            transform: 'scale(1.035) translateY(-2px)',
          },
          '100%': {
            opacity: '1',
            filter: 'blur(0)',
            transform: 'scale(1) translateY(0)',
          },
        },
        'landing-line': {
          '0%': { transform: 'scaleX(0)', opacity: '0' },
          '40%': { opacity: '1' },
          '100%': { transform: 'scaleX(1)', opacity: '1' },
        },
        'landing-card': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'landing-bg-shimmer': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        'home-loader-bar': {
          '0%, 100%': { transform: 'scaleY(0.35)', opacity: '0.45' },
          '50%': { transform: 'scaleY(1)', opacity: '1' },
        },
        'home-loader-glow': {
          '0%, 100%': { opacity: '0.35', transform: 'scale(0.92)' },
          '50%': { opacity: '0.85', transform: 'scale(1.06)' },
        },
        'home-reveal': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'landing-hero': 'landing-hero 0.5s cubic-bezier(0.34, 1.3, 0.64, 1) both',
        'landing-line': 'landing-line 0.38s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both',
        'landing-card': 'landing-card 0.48s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both',
        'landing-bg-shimmer': 'landing-bg-shimmer 0.5s ease-out both',
        'home-loader-bar': 'home-loader-bar 0.55s ease-in-out infinite',
        'home-loader-glow': 'home-loader-glow 0.7s ease-in-out infinite',
        'home-reveal': 'home-reveal 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
