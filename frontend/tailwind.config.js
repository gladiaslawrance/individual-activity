/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#070C18',
          navy: '#0B132B',
          card: '#111D3B',
          cardHover: '#162449',
          border: '#1F2E54',
          borderBright: '#2D447A',
          cyan: '#00F0FF',
          cyanDim: '#0891B2',
          blue: '#3B82F6',
          blueDim: '#1D4ED8',
          red: '#EF4444',
          redDim: '#991B1B',
          amber: '#F59E0B',
          green: '#10B981',
          textMuted: '#94A3B8',
          textLight: '#F1F5F9',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(0, 240, 255, 0.25)',
        'glow-blue': '0 0 20px -3px rgba(59, 130, 246, 0.25)',
        'glow-red': '0 0 20px -3px rgba(239, 68, 68, 0.25)',
      }
    },
  },
  plugins: [],
}
