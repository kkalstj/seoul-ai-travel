'use client';

import Link from 'next/link';
import { Search, Sparkles, UtensilsCrossed, Hotel, Landmark } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Home() {
  var { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          🗼 {t('home.hero')}
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          {t('home.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <Search className="w-5 h-5" />
            {t('home.startExplore')}
          </Link>
          <Link
            href="/ai-recommend"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            {t('home.aiRecommend')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/explore?tab=restaurant"
          className="p-6 bg-white rounded-2xl border border-orange-100 hover:shadow-lg hover:-translate-y-1 transition-all group"
        >
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UtensilsCrossed className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="font-bold text-lg text-gray-900">{t('explore.restaurant')}</h3>
          <p className="text-gray-500 text-sm mt-1">{t('home.restaurantCount')}</p>
        </Link>

        <Link
          href="/explore?tab=accommodation"
          className="p-6 bg-white rounded-2xl border border-teal-100 hover:shadow-lg hover:-translate-y-1 transition-all group"
        >
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Hotel className="w-6 h-6 text-teal-500" />
          </div>
          <h3 className="font-bold text-lg text-gray-900">{t('explore.accommodation')}</h3>
          <p className="text-gray-500 text-sm mt-1">{t('home.accommodationCount')}</p>
        </Link>

        <Link
          href="/explore?tab=attraction"
          className="p-6 bg-white rounded-2xl border border-purple-100 hover:shadow-lg hover:-translate-y-1 transition-all group"
        >
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Landmark className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="font-bold text-lg text-gray-900">{t('explore.attraction')}</h3>
          <p className="text-gray-500 text-sm mt-1">{t('home.attractionCount')}</p>
        </Link>
      </div>
    </div>
  );
}
