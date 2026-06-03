export default {
  plugins: {
    // Tailwind v4 moved its PostCSS plugin to a separate package and handles
    // vendor prefixing itself (no autoprefixer needed).
    '@tailwindcss/postcss': {},
  },
};
