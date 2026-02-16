import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Seoul AI Travel - AI와 함께하는 서울 여행',
  description: 'AI가 추천하는 서울 맛집, 관광지, 숙소를 탐색하세요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=b77467552d5af29c5dcb5d497f5cdb83&autoload=false" />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <Header />
        <main className="pb-20 md:pb-0">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
