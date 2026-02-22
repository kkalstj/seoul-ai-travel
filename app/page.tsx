'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles, UtensilsCrossed, Hotel, Landmark, Cloud, Sun, CloudRain, CloudSnow, CloudDrizzle, Droplets, Wind, Thermometer } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface WeatherData {
  temperature: string;
  sky: string;
  humidity: string;
  windSpeed: string;
  pop: string;
}

export default function Home() {
  var { t, locale } = useLanguage();
  var [weather, setWeather] = useState<WeatherData | null>(null);
  var [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(function() {
    fetch('/api/weather')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (!data.error) setWeather(data);
      })
      .catch(function(err) { console.error('날씨 로드 실패:', err); })
      .finally(function() { setWeatherLoading(false); });
  }, []);

  function getSkyIcon(sky: string) {
    switch (sky) {
      case 'rain': return <CloudRain className="w-10 h-10 text-blue-500" />;
      case 'snow': return <CloudSnow className="w-10 h-10 text-sky-400" />;
      case 'sleet': return <CloudDrizzle className="w-10 h-10 text-blue-400" />;
      case 'cloudy': return <Cloud className="w-10 h-10 text-gray-400" />;
      case 'overcast': return <Cloud className="w-10 h-10 text-gray-500" />;
      default: return <Sun className="w-10 h-10 text-yellow-400" />;
    }
  }

  function getSkyText(sky: string) {
    var skyTexts: Record<string, Record<string, string>> = {
      clear: { ko: '맑음', en: 'Clear', ja: '晴れ', zh: '晴' },
      cloudy: { ko: '구름많음', en: 'Cloudy', ja: '曇り', zh: '多云' },
      overcast: { ko: '흐림', en: 'Overcast', ja: '曇天', zh: '阴' },
      rain: { ko: '비', en: 'Rain', ja: '雨', zh: '雨' },
      snow: { ko: '눈', en: 'Snow', ja: '雪', zh: '雪' },
      sleet: { ko: '비/눈', en: 'Sleet', ja: 'みぞれ', zh: '雨夹雪' },
    };
    return skyTexts[sky]?.[locale] || skyTexts[sky]?.['en'] || sky;
  }

  function getTodayDate() {
    var now = new Date();
    var options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var localeMap: Record<string, string> = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' };
    return now.toLocaleDateString(localeMap[locale] || 'en-US', options);
  }

  function getGreeting() {
    var hour = new Date().getHours();
    var greetings: Record<string, Record<string, string>> = {
      morning: { ko: '좋은 아침이에요! ☀️', en: 'Good morning! ☀️', ja: 'おはようございます！☀️', zh: '早上好！☀️' },
      afternoon: { ko: '좋은 오후예요! 🌤️', en: 'Good afternoon! 🌤️', ja: 'こんにちは！🌤️', zh: '下午好！🌤️' },
      evening: { ko: '좋은 저녁이에요! 🌙', en: 'Good evening! 🌙', ja: 'こんばんは！🌙', zh: '晚上好！🌙' },
    };
    var period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    return greetings[period][locale] || greetings[period]['en'];
  }

  function getWeatherTip() {
    if (!weather) return '';
    var tips: Record<string, Record<string, string>> = {
      rain: { ko: '☂️ 우산을 챙기세요!', en: '☂️ Bring an umbrella!', ja: '☂️ 傘をお忘れなく！', zh: '☂️ 别忘了带伞！' },
      snow: { ko: '⛄ 따뜻하게 입으세요!', en: '⛄ Bundle up warmly!', ja: '⛄ 暖かくしてください！', zh: '⛄ 注意保暖！' },
      sleet: { ko: '🌧️ 비와 눈이 섞여요', en: '🌧️ Expect mixed rain and snow', ja: '🌧️ みぞれに注意', zh: '🌧️ 注意雨夹雪' },
      clear: { ko: '😎 여행하기 좋은 날이에요!', en: '😎 Great day for sightseeing!', ja: '😎 旅行日和です！', zh: '😎 适合出游的好天气！' },
      cloudy: { ko: '🌥️ 가벼운 겉옷을 챙기세요', en: '🌥️ Bring a light jacket', ja: '🌥️ 薄手の上着をお持ちください', zh: '🌥️ 带件薄外套吧' },
      overcast: { ko: '☁️ 흐리지만 여행은 가능해요', en: '☁️ Overcast but still good to explore', ja: '☁️ 曇りですが観光は可能です', zh: '☁️ 虽然阴天但可以出游' },
    };
    return tips[weather.sky]?.[locale] || tips['clear']?.[locale] || '';
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          🗼 {t('home.hero')}
        </h1>
        <p className="text-lg text-gray-500 mb-6">
          {t('home.subtitle')}
        </p>
      </div>

      {/* 날씨 위젯 */}
      <div className="bg-gradient-to-r from-blue-500 to-sky-400 rounded-2xl p-6 mb-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-100">{getTodayDate()}</p>
            <p className="text-lg font-medium mt-1">{getGreeting()}</p>
            {weatherLoading ? (
              <div className="mt-3 flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                <span className="text-sm text-blue-100">Loading...</span>
              </div>
            ) : weather ? (
              <div className="mt-3">
                <div className="flex items-center gap-3">
                  {getSkyIcon(weather.sky)}
                  <div>
                    <p className="text-3xl font-bold">{weather.temperature}°C</p>
                    <p className="text-sm text-blue-100">{getSkyText(weather.sky)}</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-sm text-blue-100">
                  <span className="flex items-center gap-1"><Droplets size={14} /> {weather.humidity}%</span>
                  <span className="flex items-center gap-1"><Wind size={14} /> {weather.windSpeed}m/s</span>
                  <span className="flex items-center gap-1"><CloudRain size={14} /> {weather.pop}%</span>
                </div>
                <p className="mt-3 text-sm font-medium">{getWeatherTip()}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-blue-100">{t('home.weatherError')}</p>
            )}
          </div>
          <div className="hidden md:block text-right">
            <p className="text-6xl">🏙️</p>
            <p className="text-sm text-blue-100 mt-2">Seoul, Korea</p>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
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

      {/* 카테고리 카드 */}
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
