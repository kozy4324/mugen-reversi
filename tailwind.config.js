module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        '8': 'repeat(8, minmax(0, 1fr))',
      },
      gridTemplateRows: {
        '8': 'repeat(8, minmax(0, 1fr))',
      },
      animation: {
        'flip': 'flip 0.6s ease-in-out',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        }
      }
    },
  },
  plugins: [],
};
