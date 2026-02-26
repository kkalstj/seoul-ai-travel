'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles, UtensilsCrossed, Hotel, Landmark, Cloud, Sun, CloudRain, CloudSnow, CloudDrizzle, Droplets, Wind, ExternalLink, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  sky: string;
  pop: number;
}

interface WeatherData {
  temperature: string;
  sky: string;
  humidity: string;
  windSpeed: string;
  pop: string;
  forecast?: ForecastDay[];
}

interface EventData {
  title: string;
  category: string;
  place: string;
  startDate: string;
  endDate: string;
  isFree: string;
  link: string;
  image: string;
}

export default function Home() {
  var { t, locale } = useLanguage();
  var [weather, setWeather] = useState<WeatherData | null>(null);
  var [weatherLoading, setWeatherLoading] = useState(true);
  var [events, setEvents] = useState<EventData[]>([]);
  var [eventsLoading, setEventsLoading] = useState(true);
  var [eventPage, setEventPage] = useState(0);

  useEffect(function() {
    fetch('/api/weather')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (!data.error) setWeather(data);
      })
      .catch(function(err) { console.error('날씨 로드 실패:', err); })
      .finally(function() { setWeatherLoading(false); });
  }, []);

  useEffect(function() {
    setEventsLoading(true);
    fetch('/api/events?locale=' + locale)
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.events) setEvents(data.events);
      })
      .catch(function(err) { console.error('행사 로드 실패:', err); })
      .finally(function() { setEventsLoading(false); });
  }, [locale]);

  function getSkyIcon(sky: string) {
    switch (sky) {
      case 'rain': return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'snow': return <CloudSnow className="w-8 h-8 text-sky-400" />;
      case 'sleet': return <CloudDrizzle className="w-8 h-8 text-blue-400" />;
      case 'cloudy': return <Cloud className="w-8 h-8 text-gray-400" />;
      case 'overcast': return <Cloud className="w-8 h-8 text-gray-500" />;
      default: return <Sun className="w-8 h-8 text-yellow-400" />;
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
      sleet: { ko: '🌧️ 비와 눈이 섞여요', en: '🌧️ Mixed rain and snow', ja: '🌧️ みぞれに注意', zh: '🌧️ 注意雨夹雪' },
      clear: { ko: '😎 여행하기 좋은 날!', en: '😎 Great day for travel!', ja: '😎 旅行日和！', zh: '😎 适合出游！' },
      cloudy: { ko: '🌥️ 겉옷을 챙기세요', en: '🌥️ Bring a light jacket', ja: '🌥️ 上着をお持ちください', zh: '🌥️ 带件外套吧' },
      overcast: { ko: '☁️ 흐리지만 여행은 OK', en: '☁️ Overcast but good to go', ja: '☁️ 曇りですが観光OK', zh: '☁️ 阴天但可出游' },
    };
    return tips[weather.sky]?.[locale] || tips['clear']?.[locale] || '';
  }

  function getDayLabel(dateStr: string) {
    var date = new Date(dateStr);
    var days: Record<string, string[]> = {
      ko: ['일', '월', '화', '수', '목', '금', '토'],
      en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      ja: ['日', '月', '火', '水', '木', '金', '土'],
      zh: ['日', '一', '二', '三', '四', '五', '六'],
    };
    var dayNames = days[locale] || days['en'];
    return dayNames[date.getDay()];
  }

  function getSmallSkyIcon(sky: string) {
    switch (sky) {
      case 'rain': return '🌧️';
      case 'snow': return '❄️';
      case 'sleet': return '🌨️';
      case 'cloudy': return '⛅';
      case 'overcast': return '☁️';
      default: return '☀️';
    }
  }
  
  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    return dateStr.replace(/-/g, '.');
  }

  var eventsPerPage = 3;
  var totalPages = Math.ceil(events.length / eventsPerPage);
  var visibleEvents = events.slice(eventPage * eventsPerPage, (eventPage + 1) * eventsPerPage);

  var eventLabels: Record<string, Record<string, string>> = {
    title: { ko: '행사', en: 'Seoul Events', ja: 'ソウルイベント', zh: '首尔活动' },
    free: { ko: '무료', en: 'Free', ja: '無料', zh: '免费' },
    paid: { ko: '유료', en: 'Paid', ja: '有料', zh: '收费' },
    noEvents: { ko: '현재 행사 정보가 없습니다', en: 'No events available', ja: 'イベント情報がありません', zh: '暂无活动信息' },
    detail: { ko: '상세보기', en: 'Details', ja: '詳細', zh: '详情' },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          <svg className="inline-block w-14 h-14 md:w-16 md:h-16 -mt-2" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 원형 배경 */}
            <circle cx="60" cy="60" r="56" stroke="#3B82F6" strokeWidth="2.5" fill="white"/>
            
            {/* 산 배경 */}
            <path d="M20 85 Q40 55 60 70 Q80 55 100 85" fill="#DBEAFE" opacity="0.5"/>
            
            {/* 경복궁 지붕 */}
            <path d="M25 88 L35 78 L45 88 Z" fill="#1E40AF"/>
            <path d="M28 88 L35 82 L42 88 Z" fill="#3B82F6"/>
            <rect x="30" y="88" width="10" height="6" fill="#60A5FA"/>
            <rect x="31" y="89" width="3" height="4" rx="0.5" fill="#DBEAFE"/>
            <rect x="36" y="89" width="3" height="4" rx="0.5" fill="#DBEAFE"/>
            
            {/* N서울타워 기둥 */}
            <rect x="58" y="42" width="4" height="46" fill="#6B7280"/>
            <rect x="57" y="40" width="6" height="4" rx="1" fill="#4B5563"/>
            
            {/* N서울타워 전망대 */}
            <ellipse cx="60" cy="38" rx="10" ry="4" fill="#3B82F6"/>
            <rect x="51" y="34" width="18" height="4" rx="2" fill="#2563EB"/>
            <ellipse cx="60" cy="34" rx="9" ry="3" fill="#3B82F6"/>
            
            {/* 전망대 창문 */}
            <rect x="53" y="34.5" width="2.5" height="2.5" rx="0.5" fill="#FDE68A"/>
            <rect x="57" y="34.5" width="2.5" height="2.5" rx="0.5" fill="#FDE68A"/>
            <rect x="61" y="34.5" width="2.5" height="2.5" rx="0.5" fill="#FDE68A"/>
            <rect x="65" y="34.5" width="2.5" height="2.5" rx="0.5" fill="#FDE68A"/>
            
            {/* 안테나 */}
            <rect x="59.5" y="22" width="1" height="12" fill="#9CA3AF"/>
            <circle cx="60" cy="21" r="1.5" fill="#EF4444"/>
            
            {/* N 글자 */}
            <text x="60" y="45" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">N</text>
            
            {/* 오른쪽 한옥 */}
            <path d="M75 88 L85 78 L95 88 Z" fill="#1E40AF"/>
            <path d="M78 88 L85 82 L92 88 Z" fill="#3B82F6"/>
            <rect x="80" y="88" width="10" height="6" fill="#60A5FA"/>
            <rect x="81" y="89" width="3" height="4" rx="0.5" fill="#DBEAFE"/>
            <rect x="86" y="89" width="3" height="4" rx="0.5" fill="#DBEAFE"/>
            
            {/* 바닥선 */}
            <line x1="20" y1="94" x2="100" y2="94" stroke="#BFDBFE" strokeWidth="1.5"/>
            
            {/* SEOUL 텍스트 */}
            <text x="60" y="105" textAnchor="middle" fill="#3B82F6" fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif">SEOUL</text>
          </svg>
          {' '}{t('home.hero')}
        </h1>
        <p className="text-lg text-gray-500 mb-6">
          {t('home.subtitle')}
        </p>
      </div>

      {/* 행사 + 날씨 위젯 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* 행사 (왼쪽 2칸) */}
        <div className="md:col-span-2 bg-white rounded-2xl border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">{eventLabels.title[locale]}</h3>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={function() { setEventPage(Math.max(0, eventPage - 1)); }}
                  disabled={eventPage === 0}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-gray-400">{eventPage + 1}/{totalPages}</span>
                <button
                  onClick={function() { setEventPage(Math.min(totalPages - 1, eventPage + 1)); }}
                  disabled={eventPage === totalPages - 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {eventsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              {eventLabels.noEvents[locale]}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleEvents.map(function(event, i) {
                return (
                  <a
                    key={i}
                    href={event.link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition group"
                  >
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-20 h-20 object-cover rounded-lg shrink-0"
                        onError={function(e) { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{event.category}</span>
                        {event.isFree === '무료' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">{eventLabels.free[locale]}</span>
                        )}
                      </div>
                      <p className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-600 transition">{event.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {formatDate(event.startDate)} ~ {formatDate(event.endDate)}
                        </span>
                        {event.place && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin size={10} />
                            {event.place}
                          </span>
                        )}
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-500 shrink-0 mt-1 transition" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* 날씨 (오른쪽 1칸) */}
        <div className="bg-gradient-to-b from-blue-500 to-sky-400 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-sm text-blue-100">{getGreeting()}</p>
          <p className="text-xs text-blue-200 mt-0.5">Seoul, Korea</p>

          {weatherLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            </div>
          ) : weather ? (
            <div className="mt-4">
              <div className="flex items-center gap-3">
                {getSkyIcon(weather.sky)}
                <div>
                  <p className="text-3xl font-bold">{weather.temperature}°C</p>
                  <p className="text-sm text-blue-100">{getSkyText(weather.sky)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="bg-white/15 rounded-lg py-2">
                  <Droplets size={14} className="mx-auto mb-1" />
                  <p className="text-xs">{weather.humidity}%</p>
                </div>
                <div className="bg-white/15 rounded-lg py-2">
                  <Wind size={14} className="mx-auto mb-1" />
                  <p className="text-xs">{weather.windSpeed}m/s</p>
                </div>
                <div className="bg-white/15 rounded-lg py-2">
                  <CloudRain size={14} className="mx-auto mb-1" />
                  <p className="text-xs">{weather.pop}%</p>
                </div>
              </div>
              <p className="mt-3 text-xs font-medium text-center">{getWeatherTip()}</p>
              
              {weather.forecast && weather.forecast.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/20 space-y-2">
                  {weather.forecast.map(function(day, i) {
                    return (
                      <div key={i} className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-1.5">
                        <span className="text-xs font-medium w-8">{getDayLabel(day.date)}</span>
                        <span className="text-sm">{getSmallSkyIcon(day.sky)}</span>
                        <span className="text-xs text-blue-200">{day.pop}%</span>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-blue-200">{day.tempMin}°</span>
                          <div className="w-12 h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white/60 rounded-full" style={{width: Math.min(100, Math.max(20, (day.tempMax + 10) * 3)) + '%'}} />
                          </div>
                          <span className="font-medium">{day.tempMax}°</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-blue-100">{t('home.weatherError')}</p>
          )}
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
