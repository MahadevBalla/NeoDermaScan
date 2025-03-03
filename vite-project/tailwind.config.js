// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This includes all JSX/TSX files in src and its subfolders
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          500: '#FF7F50', // Coral color
          600: '#FF6B3B', // Darker shade for hover
        },
      },
    },
  },
  plugins: [],
};