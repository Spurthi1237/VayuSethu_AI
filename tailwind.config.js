/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official Brand Color Palette
        forest: {
          DEFAULT: '#183D32',
          950: '#0E241E',
          900: '#14332A',
          800: '#183D32', // Primary Forest Green
          700: '#235747',
          600: '#2F735E',
          500: '#3D9177',
        },
        sage: {
          DEFAULT: '#78947A',
          light: '#9CB49E',
          soft: '#E6ECE7',
          border: '#C4D4C6',
          muted: '#637D65',
        },
        ivory: {
          DEFAULT: '#EDEBDD',
          light: '#F8F7F2',
          card: '#FFFFFF',
          subtle: '#F2F0E5',
          border: '#DFDC output',
          borderStrong: '#D1CDC0',
        },
        gold: {
          DEFAULT: '#B9A47A',
          light: '#D9CCA9',
          dark: '#93805B',
          soft: '#F4EFE6',
        },
        charcoal: {
          DEFAULT: '#292E2A',
          900: '#1B1F1C',
          800: '#292E2A', // Primary Charcoal
          700: '#3B423D',
          600: '#545E57',
          muted: '#6E7A71',
        },
        white: '#FFFFFF',

        // Harmonious, Tasteful Environmental NAQI Scale (Non-neon, editorial tones)
        severity: {
          good: '#183D32',        // Forest Green (0-50)
          satisfactory: '#5B8260',// Muted Sage (51-100)
          moderate: '#C2873E',    // Muted Amber / Ochre (101-200)
          poor: '#B24E38',        // Terracotta Rust (201-300)
          veryPoor: '#7A3E5D',    // Deep Plum (301-400)
          severe: '#8A2222',      // Deep Crimson (401-500)
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'editorial': '0 1px 3px 0 rgba(41, 46, 42, 0.04), 0 1px 2px -1px rgba(41, 46, 42, 0.04)',
        'editorial-md': '0 4px 6px -1px rgba(41, 46, 42, 0.05), 0 2px 4px -2px rgba(41, 46, 42, 0.05)',
        'editorial-lg': '0 10px 15px -3px rgba(41, 46, 42, 0.06), 0 4px 6px -4px rgba(41, 46, 42, 0.04)',
        'sidebar-nav': '0 2px 4px 0 rgba(14, 36, 30, 0.25)',
      },
    },
  },
  plugins: [],
};
