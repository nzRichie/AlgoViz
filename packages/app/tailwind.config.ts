import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'ctp-base': 'var(--ctp-base)',
        'ctp-mantle': 'var(--ctp-mantle)',
        'ctp-crust': 'var(--ctp-crust)',
        'ctp-surface0': 'var(--ctp-surface0)',
        'ctp-surface1': 'var(--ctp-surface1)',
        'ctp-surface2': 'var(--ctp-surface2)',
        'ctp-overlay0': 'var(--ctp-overlay0)',
        'ctp-overlay1': 'var(--ctp-overlay1)',
        'ctp-overlay2': 'var(--ctp-overlay2)',
        'ctp-subtext0': 'var(--ctp-subtext0)',
        'ctp-subtext1': 'var(--ctp-subtext1)',
        'ctp-text': 'var(--ctp-text)',
        'ctp-lavender': 'var(--ctp-lavender)',
        'ctp-blue': 'var(--ctp-blue)',
        'ctp-sapphire': 'var(--ctp-sapphire)',
        'ctp-sky': 'var(--ctp-sky)',
        'ctp-teal': 'var(--ctp-teal)',
        'ctp-green': 'var(--ctp-green)',
        'ctp-yellow': 'var(--ctp-yellow)',
        'ctp-peach': 'var(--ctp-peach)',
        'ctp-maroon': 'var(--ctp-maroon)',
        'ctp-red': 'var(--ctp-red)',
        'ctp-mauve': 'var(--ctp-mauve)',
        'ctp-pink': 'var(--ctp-pink)',
        'ctp-flamingo': 'var(--ctp-flamingo)',
        'ctp-rosewater': 'var(--ctp-rosewater)',
      },
    },
  },
  plugins: [],
};

export default config;
