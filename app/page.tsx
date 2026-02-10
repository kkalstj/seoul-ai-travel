'use client';

import Link from 'next/link';
import { Search, Sparkles, UtensilsCrossed, Hotel, Landmark } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* 히어로 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          🗼 AI와 함께하는
          <br />
          <span className="text-blue-600">서울 여행</span>
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          12만+ 음식점, 900+ 숙소, 700+ 관광지를 AI가 추천합니다
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <Search className="w-5 h-5" />
            직접 탐색하기
          </Link>
          <Link
            href="/ai-recommend"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            AI 추천 받기
          </Link>
        </div>
      </div>

      {/* 카테고리 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/explore?tab=restaurant"
          className="p-6 bg-white rounded-2xl border border-orange-100 hover:shadow-lg hover:-translate-y-1 transition-all group"
        >
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UtensilsCrossed className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="font-bold text-lg text-gray-900">음식점</h3>
          <p className="text-gray-500 text-sm mt-1">122,000+ 서울 맛집</p>
        </Link>

        <Link
          href="/explore?tab=accommodation"
          className="p-6 bg-white rounded-2xl border border-teal-100 hover:shadow-lg hover:-translate-y-1 transition-all group"
        >
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Hotel className="w-6 h-6 text-teal-500" />
          </div>
          <h3 className="font-bold text-lg text-gray-900">숙소</h3>
          <p className="text-gray-500 text-sm mt-1">900+ 호텔 · 게스트하우스</p>
        </Link>

        <Link
          href="/explore?tab=attraction"
          className="p-6 bg-white rounded-2xl border border-purple-100 hover:shadow-lg hover:-translate-y-1 transition-all group"
        >
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Landmark className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="font-bold text-lg text-gray-900">관광지</h3>
          <p className="text-gray-500 text-sm mt-1">700+ 명소 · 볼거리</p>
        </Link>
      </div>
    </div>
  );
}