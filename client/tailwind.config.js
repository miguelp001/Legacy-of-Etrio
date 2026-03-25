/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-color': 'var(--primary-color)',
        'primary-dark': 'var(--primary-dark)',
        'primary-light': 'var(--primary-light)',
        'primary-glow': 'var(--primary-glow)',
        'secondary-color': 'var(--secondary-color)',
        'accent-color': 'var(--accent-color)',
        'danger-color': 'var(--danger-color)',
        'warning-color': 'var(--warning-color)',
        'success-color': 'var(--success-color)',
        'gold': 'var(--gold)',
        'crimson': 'var(--crimson)',
        'blood': 'var(--blood)',
        'bone': 'var(--bone)',
        'iron': 'var(--iron)',
        'ash': 'var(--ash)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'text-dim': 'var(--text-dim)',
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'Times New Roman', 'serif'],
        'crimson': ['Crimson Pro', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glow': '0 0 10px rgba(239, 68, 68, 0.5)',
        'glow-lg': '0 0 20px rgba(239, 68, 68, 0.7)',
      },
      textShadow: {
        'glow': '0 0 8px rgba(239, 68, 68, 0.8)',
      },
    },
  },
  plugins: [],
}
