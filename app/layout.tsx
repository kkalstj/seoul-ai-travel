import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import AuthProvider from '@/components/auth/AuthProvider';
import LanguageProvider from '@/lib/i18n/LanguageContext';
import Footer from '@/components/layout/Footer';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Seoul AI Travel - AI와 함께하는 서울 여행',
  description: 'AI가 추천하는 서울 맛집, 관광지, 숙소를 탐색하세요',
   verification: {
    google: '<meta name="google-site-verification" content="RHpKCUJC9tSUHpTqHDlfQNHTbGI23DPPv8-S0O5EmWk" />',
   },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4088074968907716"
          crossOrigin="anonymous"
          strategy="afterInteractive"
          <meta name="google-site-verification" content="jrEoOM2ZRVBZTTKQL5ePBAgDA_lDAET_LXfNUZsGt8E" />
          />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <LanguageProvider>
          <AuthProvider>
            <Header />
            <main className="pb-20 md:pb-0">{children}</main>
            <BottomNav />
            <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
