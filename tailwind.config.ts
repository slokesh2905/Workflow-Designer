import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens for the HR Workflow Designer
        surface: {
          DEFAULT: '#030712', // gray-950 – canvas base
          raised: '#0f172a',  // gray-900 – panels
          overlay: '#1e293b', // gray-800 – cards / dialogs
          border: '#334155',  // gray-700 – dividers
        },
        brand: {
          DEFAULT: '#6366f1', // indigo-500
          light: '#818cf8',   // indigo-400
          dark: '#4f46e5',    // indigo-600
        },
        accent: {
          green: '#10b981',   // emerald-500 – success / approved
          amber: '#f59e0b',   // amber-500  – pending
          rose: '#f43f5e',    // rose-500   – rejected / error
          sky: '#38bdf8',     // sky-400    – info
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        flow: '0.75rem',  // rounded node corners
      },
      boxShadow: {
        node: '0 0 0 1px rgba(99,102,241,0.25), 0 4px 24px rgba(0,0,0,0.6)',
        'node-selected': '0 0 0 2px #6366f1, 0 4px 32px rgba(99,102,241,0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(1rem)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
