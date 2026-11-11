/** Muster design tokens. Peacock (primary), saffron (attention), lotus (danger), moss (done). */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Values come from CSS variables (see index.css). The default set is the original Muster look used by the
        // login page; the signed-in app switches to the Nexora set via the `nx` class on <html>.
        paper: 'rgb(var(--paper) / <alpha-value>)', mute: 'rgb(var(--mute) / <alpha-value>)', line: 'rgb(var(--line) / <alpha-value>)',
        ink: { DEFAULT: 'rgb(var(--ink) / <alpha-value>)', 800: 'rgb(var(--ink-800) / <alpha-value>)', 700: 'rgb(var(--ink-700) / <alpha-value>)', 600: 'rgb(var(--ink-600) / <alpha-value>)' },
        peacock: Object.fromEntries([50, 100, 200, 500, 600, 700, 800].map((n) => [n, `rgb(var(--peacock-${n}) / <alpha-value>)`])),
        saffron: Object.fromEntries([50, 100, 500, 600, 700].map((n) => [n, `rgb(var(--saffron-${n}) / <alpha-value>)`])),
        lotus: Object.fromEntries([50, 100, 500, 600, 700].map((n) => [n, `rgb(var(--lotus-${n}) / <alpha-value>)`])),
        moss: Object.fromEntries([50, 100, 500, 600, 700].map((n) => [n, `rgb(var(--moss-${n}) / <alpha-value>)`])),
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '14px', ctl: '10px', sheet: '20px' },
      boxShadow: { pop: '0 12px 32px -8px rgba(17,36,43,.28), 0 2px 6px rgba(17,36,43,.08)' },
    },
  },
  plugins: [],
};
