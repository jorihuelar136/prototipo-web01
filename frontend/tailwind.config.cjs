module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#baddff',
          300: '#8ac7ff',
          400: '#52a9fa',
          500: '#1f87ed',
          600: '#0d69d1',
          700: '#0b56aa',
          800: '#0e4a8b',
          900: '#123f72'
        },
        accent: {
          400: '#ffb347',
          500: '#ff9f1c',
          600: '#e17900'
        }
      },
      fontFamily: {
        display: ['Merriweather', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        slab: ['"Roboto Slab"', 'serif']
      },
      backgroundImage: {
        'hero-men': "url('https://images.unsplash.com/photo-1525299374597-2d82f0d5f229?auto=format&fit=crop&w=1600&q=80')",
        'overlay-pattern': "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15), transparent 60%)",
      }
    }
  },
  plugins: []
};
