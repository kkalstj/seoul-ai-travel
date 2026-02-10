import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',     // 메인 브랜드 색상
        restaurant: '#FF6B35',
        accommodation: '#4ECDC4',
        attraction: '#7B68EE',
        subway: '#45B7D1',
      },
    },
  },
  plugins: [],
};

export default config;
