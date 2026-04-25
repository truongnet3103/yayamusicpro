/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6B2D3E',
          light: '#8B3D52',
          dark: '#4A1E2B',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E0C06A',
          dark: '#A8872E',
        },
        cream: {
          DEFAULT: '#F8F4E9',
          dark: '#EDE8D5',
        },
        navy: {
          DEFAULT: '#1B2A4A',
          light: '#263C6B',
        },
        charcoal: '#2C3E50',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Be Vietnam Pro', 'Inter', 'sans-serif'],
        accent: ['EB Garamond', 'Georgia', 'serif'],
      },
      boxShadow: {
        elegant: '0 4px 24px rgba(107, 45, 62, 0.12)',
        card: '0 2px 12px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
};
