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
  var [articles, setArticles] = useState<any[]>([]);
  var [articlesLoading, setArticlesLoading] = useState(true);
      

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

  useEffect(function() {
   fetch('/api/articles?locale=' + locale)
     .then(function(res) { return res.json(); })
     .then(function(data) {
       if (data.articles) setArticles(data.articles);
     })
     .catch(function(err) { console.error('아티클 로드 실패:', err); })
     .finally(function() { setArticlesLoading(false); });
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

      {/* 버튼 */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
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

     {/* AI 추천 아티클 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">
            {locale === 'ko' ? 'AI 추천 서울 여행 가이드' :
             locale === 'ja' ? 'AIおすすめソウル旅行ガイド' :
             locale === 'zh' ? 'AI推荐首尔旅行指南' :
             'AI-Curated Seoul Travel Guides'}
          </h3>
        </div>

        {articlesLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            {locale === 'ko' ? '아티클을 준비 중입니다' :
             locale === 'ja' ? '記事を準備中です' :
             locale === 'zh' ? '文章准备中' :
             'Articles coming soon'}
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map(function(article: any) {
              return (
                <Link
                  key={article.id}
                  href={'/article/' + article.id}
                  className="flex gap-4 p-4 bg-white rounded-2xl border hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                >
                  <div className={'w-28 h-28 md:w-32 md:h-32 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 text-4xl ' + article.color_from + ' ' + article.color_to}>
                    {article.emoji}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + article.badge_bg + ' ' + article.badge_text}>
                      {article.category}
                    </span>
                    <h4 className="font-bold text-gray-900 mt-1.5 mb-2 group-hover:text-blue-600 transition leading-snug">
                      {article.title}
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
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

      {/* 서비스 소개 */}
      <div className="mt-12 bg-white rounded-2xl border p-6 md:p-8">
        <h2 className="font-bold text-lg text-gray-900 mb-4">
          {locale === 'ko' ? 'Seoul AI Travel은 어떤 서비스인가요?' :
           locale === 'ja' ? 'Seoul AI Travelとはどんなサービスですか？' :
           locale === 'zh' ? 'Seoul AI Travel是什么样的服务？' :
           'What is Seoul AI Travel?'}
        </h2>
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p>
            {locale === 'ko' ? 'Seoul AI Travel은 Google Gemini AI 기술을 활용하여 서울 여행을 계획하는 모든 분들에게 맞춤형 여행 코스를 추천해 드리는 무료 서비스입니다. 단순히 인기 관광지를 나열하는 것이 아니라, 사용자의 취향, 일정, 인원, 여행 스타일을 종합적으로 분석하여 최적의 동선을 설계합니다. 음식점, 관광지, 숙소 등 12만 건 이상의 서울 관광 데이터를 AI가 실시간으로 분석하고, 각 장소 간의 대중교통 경로와 소요 시간까지 함께 안내하여 효율적인 여행을 도와드립니다.' :
             locale === 'ja' ? 'Seoul AI TravelはGoogle Gemini AI技術を活用し、ソウル旅行を計画するすべての方にカスタマイズされた旅行コースを推薦する無料サービスです。単に人気観光地を羅列するのではなく、ユーザーの好み、日程、人数、旅行スタイルを総合的に分析して最適な動線を設計します。レストラン、観光地、宿泊施設など12万件以上のソウル観光データをAIがリアルタイムで分析し、各場所間の公共交通ルートと所要時間もご案内します。' :
             locale === 'zh' ? 'Seoul AI Travel是一项利用Google Gemini AI技术，为所有计划首尔旅行的用户推荐定制旅行路线的免费服务。我们不仅仅是列出热门景点，而是综合分析用户的喜好、行程、人数和旅行风格，设计最优路线。AI实时分析超过12万条首尔旅游数据，包括餐厅、景点、住宿等，并为您提供各地点之间的公共交通路线和所需时间。' :
             'Seoul AI Travel is a free service that uses Google Gemini AI technology to recommend personalized travel courses for everyone planning a trip to Seoul. Rather than simply listing popular attractions, we comprehensively analyze your preferences, schedule, group size, and travel style to design optimal routes. Our AI analyzes over 120,000 Seoul tourism data points in real-time, including restaurants, attractions, and accommodations, and provides public transit routes and travel times between each location.'}
          </p>
          <p>
            {locale === 'ko' ? '또한 AI가 최신 트렌드를 반영하여 매주 새로운 여행 아티클을 자동 생성합니다. 미슐랭 선정 맛집, 화제의 TV 프로그램 촬영지, 계절별 축제와 행사 정보 등을 반영한 테마별 여행 코스를 통해 항상 새롭고 신선한 서울 여행을 경험하실 수 있습니다. 내 여행 기능을 통해 AI가 추천한 코스를 저장하고, 장소를 자유롭게 추가하거나 삭제하며 나만의 맞춤 여행 일정을 완성할 수 있습니다. 공유 기능을 활용하면 친구나 가족과 함께 여행 계획을 공유하는 것도 간편합니다.' :
             locale === 'ja' ? 'また、AIが最新トレンドを反映して毎週新しい旅行記事を自動生成します。ミシュラン選定グルメ、話題のTV番組ロケ地、季節ごとの祭りやイベント情報を反映したテーマ別旅行コースで、常に新鮮なソウル旅行を体験できます。マイトリップ機能でAI推薦コースを保存し、場所を自由に追加・削除して自分だけの旅行日程を完成できます。共有機能で友人や家族と旅行計画を簡単に共有することもできます。' :
             locale === 'zh' ? '此外，AI每周自动生成反映最新趋势的旅行文章。通过反映米其林推荐餐厅、热门电视节目拍摄地、各季节庆典和活动信息的主题旅行路线，您可以随时体验新鲜的首尔之旅。通过我的旅行功能，您可以保存AI推荐的路线，自由添加或删除地点，完成专属定制行程。利用分享功能，还可以轻松与朋友或家人共享旅行计划。' :
             'Additionally, our AI automatically generates new travel articles every week reflecting the latest trends. Through themed travel courses featuring Michelin-selected restaurants, trending TV show filming locations, and seasonal festival information, you can always experience fresh and exciting Seoul trips. With the My Trip feature, you can save AI-recommended courses, freely add or remove places, and complete your own customized itinerary. The sharing feature makes it easy to share travel plans with friends and family.'}
          </p>
          <p>
            {locale === 'ko' ? '서울의 날씨와 현재 진행 중인 행사 정보도 실시간으로 제공되어 여행 준비에 참고하실 수 있으며, 한국어, 영어, 일본어, 중국어 4개 언어를 지원하여 전 세계 여행자들이 편리하게 이용할 수 있습니다. Seoul AI Travel과 함께 당신만의 특별한 서울 여행을 시작해 보세요.' :
             locale === 'ja' ? 'ソウルの天気や現在開催中のイベント情報もリアルタイムで提供され、旅行準備にお役立ていただけます。韓国語、英語、日本語、中国語の4言語に対応し、世界中の旅行者が便利にご利用いただけます。Seoul AI Travelと一緒に、あなただけの特別なソウル旅行を始めましょう。' :
             locale === 'zh' ? '首尔的天气和当前举办的活动信息也会实时提供，供您参考准备旅行。支持韩语、英语、日语、中文四种语言，方便全球旅行者使用。与Seoul AI Travel一起，开启属于您的特别首尔之旅吧。' :
             'Real-time Seoul weather and current event information are also provided to help you prepare for your trip. Supporting four languages — Korean, English, Japanese, and Chinese — travelers from around the world can conveniently use our service. Start your special Seoul journey with Seoul AI Travel today.'}
          </p>
        </div>
      </div>
      
    </div>
  );
}
