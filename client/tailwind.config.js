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
        'secondary-color': 'var(--secondary-color)',
        'accent-color': 'var(--accent-color)',
        'danger-color': 'var(--danger-color)',
        'warning-color': 'var(--warning-color)',
        'primary-glow': 'var(--primary-glow)',
      }
    },
  },
  plugins: [],
}
