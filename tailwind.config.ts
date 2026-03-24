import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        'primary-dark': '#1e3a8a',
        accent: '#facc15',
        'accent-dark': '#eab308',
        success: '#10b981',
        danger: '#ef4444',
      },
      borderRadius: {
        'xl': '0.75rem',
      },
    },
  },
  plugins: [],
}
export default config
