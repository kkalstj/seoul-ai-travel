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
        <div className="space-y-4">

          {/* 아티클 1 */}
          <Link
            href="/ai-recommend"
            className="flex gap-4 p-4 bg-white rounded-2xl border hover:shadow-lg hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center shrink-0 text-4xl">
              🌸
            </div>
            <div className="flex-1 min-w-0 py-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 font-medium">
                {locale === 'ko' ? '계절 추천' : locale === 'ja' ? '季節おすすめ' : locale === 'zh' ? '季节推荐' : 'Seasonal'}
              </span>
              <h4 className="font-bold text-gray-900 mt-1.5 mb-2 group-hover:text-blue-600 transition leading-snug">
                {locale === 'ko' ? 'AI가 분석한 서울 벚꽃 나들이 완벽 코스' :
                 locale === 'ja' ? 'AIが分析したソウル桜お花見完璧コース' :
                 locale === 'zh' ? 'AI分析的首尔赏樱完美路线' :
                 'AI-Analyzed Perfect Cherry Blossom Course in Seoul'}
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                {locale === 'ko' ? '여의도 윤중로에서 시작해 석촌호수, 남산까지 이어지는 벚꽃 명소를 AI가 최적 동선으로 분석했습니다. 각 장소의 만개 시기와 인근 맛집 정보까지 한번에 확인하세요. 도보와 대중교통을 활용한 효율적인 이동 경로를 제안합니다.' :
                 locale === 'ja' ? '汝矣島の輪中路から石村湖、南山まで続く桜の名所をAIが最適な動線で分析しました。各スポットの満開時期や周辺グルメ情報も一目で確認できます。徒歩と公共交通を活用した効率的な移動ルートをご提案します。' :
                 locale === 'zh' ? 'AI以最优路线分析了从汝矣岛轮中路到石村湖、南山的赏樱名胜。一次确认各景点的盛开时期和附近美食信息。为您推荐步行和公共交通相结合的高效出行路线。' :
                 'AI analyzed the best cherry blossom spots from Yeouido Yunjung-ro to Seokchon Lake and Namsan with optimal routing. Check bloom timing and nearby restaurants all at once. Efficient routes combining walking and public transit are suggested.'}
              </p>
            </div>
          </Link>

          {/* 아티클 2 */}
          <Link
            href="/ai-recommend"
            className="flex gap-4 p-4 bg-white rounded-2xl border hover:shadow-lg hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center shrink-0 text-4xl">
              🌧️
            </div>
            <div className="flex-1 min-w-0 py-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                {locale === 'ko' ? '실내 코스' : locale === 'ja' ? '室内コース' : locale === 'zh' ? '室内路线' : 'Indoor'}
              </span>
              <h4 className="font-bold text-gray-900 mt-1.5 mb-2 group-hover:text-blue-600 transition leading-snug">
                {locale === 'ko' ? '비 오는 날 서울에서 즐기기 좋은 실내 데이트 동선' :
                 locale === 'ja' ? '雨の日にソウルで楽しむ室内デートコース' :
                 locale === 'zh' ? '雨天首尔室内约会路线推荐' :
                 'Best Indoor Date Courses in Seoul for Rainy Days'}
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                {locale === 'ko' ? '갑자기 비가 와도 걱정 없는 서울 실내 데이트 코스를 소개합니다. 성수동 카페 거리부터 코엑스 아쿠아리움, 이태원 앤틱 가구 거리까지. 각 장소 간 지하도와 연결 통로를 활용한 비를 피하는 이동 경로도 함께 안내해 드립니다.' :
                 locale === 'ja' ? '突然の雨でも心配いらないソウルの室内デートコースをご紹介します。聖水洞カフェ通りからCOEXアクアリウム、梨泰院アンティーク家具通りまで。地下道や連絡通路を活用した雨を避ける移動ルートもご案内します。' :
                 locale === 'zh' ? '介绍下雨也不用担心的首尔室内约会路线。从圣水洞咖啡街到COEX水族馆、梨泰院古董家具街。同时为您介绍利用地下通道和连接通道避雨的移动路线。' :
                 'Discover worry-free indoor date courses in Seoul for rainy days. From Seongsu-dong cafe street to COEX Aquarium and Itaewon antique furniture street. We also guide you through underground passages to stay dry between venues.'}
              </p>
            </div>
          </Link>

          {/* 아티클 3 */}
          <Link
            href="/ai-recommend"
            className="flex gap-4 p-4 bg-white rounded-2xl border hover:shadow-lg hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center shrink-0 text-4xl">
              🍜
            </div>
            <div className="flex-1 min-w-0 py-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-medium">
                {locale === 'ko' ? '맛집 투어' : locale === 'ja' ? 'グルメツアー' : locale === 'zh' ? '美食之旅' : 'Food Tour'}
              </span>
              <h4 className="font-bold text-gray-900 mt-1.5 mb-2 group-hover:text-blue-600 transition leading-snug">
                {locale === 'ko' ? '현지인만 아는 서울 골목 맛집 1일 코스' :
                 locale === 'ja' ? '地元民だけが知るソウル路地裏グルメ1日コース' :
                 locale === 'zh' ? '只有当地人知道的首尔巷弄美食一日游' :
                 'Local-Only Seoul Alley Food Tour: A Full Day Course'}
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                {locale === 'ko' ? '관광객이 잘 모르는 을지로 노포 골목, 망원동 로컬 맛집, 연남동 숨은 디저트 카페까지. AI가 리뷰 데이터를 분석해 현지인 재방문율이 높은 맛집만 엄선했습니다. 아침부터 야식까지 하루 종일 먹방 여행을 즐겨보세요.' :
                 locale === 'ja' ? '観光客があまり知らない乙支路の老舗路地、望遠洞のローカルグルメ、延南洞の隠れたデザートカフェまで。AIがレビューデータを分析し、地元民のリピート率が高い店だけを厳選しました。朝から夜食まで一日中食べ歩きを楽しみましょう。' :
                 locale === 'zh' ? '从游客不太知道的乙支路老店巷弄、望远洞本地美食到延南洞隐藏甜点咖啡厅。AI分析评论数据，精选当地人回访率高的餐厅。从早餐到夜宵，享受一整天的美食之旅吧。' :
                 'From hidden Euljiro alley restaurants to Mangwon-dong local eateries and secret dessert cafes in Yeonnam-dong. AI analyzed review data to curate restaurants with high local revisit rates. Enjoy a full day food tour from breakfast to late-night snacks.'}
              </p>
            </div>
          </Link>

          {/* 아티클 4 */}
          <Link
            href="/ai-recommend"
            className="flex gap-4 p-4 bg-white rounded-2xl border hover:shadow-lg hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-violet-100 to-purple-200 flex items-center justify-center shrink-0 text-4xl">
              🌃
            </div>
            <div className="flex-1 min-w-0 py-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">
                {locale === 'ko' ? '야경 코스' : locale === 'ja' ? '夜景コース' : locale === 'zh' ? '夜景路线' : 'Night View'}
              </span>
              <h4 className="font-bold text-gray-900 mt-1.5 mb-2 group-hover:text-blue-600 transition leading-snug">
                {locale === 'ko' ? '서울 야경 베스트 5 — 일몰부터 자정까지 완벽 루트' :
                 locale === 'ja' ? 'ソウル夜景ベスト5 — 日没から深夜まで完璧ルート' :
                 locale === 'zh' ? '首尔夜景TOP5 — 从日落到午夜的完美路线' :
                 'Top 5 Seoul Night Views — Perfect Route from Sunset to Midnight'}
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                {locale === 'ko' ? 'N서울타워 일몰 감상을 시작으로 한강 반포대교 달빛무지개분수, DDP 야간 조명, 낙산공원 성곽길 야경, 이태원 루프탑 바까지. 서울의 밤을 가장 아름답게 즐기는 동선을 AI가 시간대별로 설계했습니다.' :
                 locale === 'ja' ? 'Nソウルタワーの夕日観賞を皮切りに、漢江盤浦大橋の月光レインボー噴水、DDP夜間照明、駱山公園城郭路の夜景、梨泰院ルーフトップバーまで。ソウルの夜を最も美しく楽しむ動線をAIが時間帯別に設計しました。' :
                 locale === 'zh' ? '从N首尔塔欣赏日落开始，到汉江盘浦大桥月光彩虹喷泉、DDP夜间灯光、骆山公园城郭路夜景、梨泰院屋顶酒吧。AI按时间段设计了最美丽地享受首尔夜晚的路线。' :
                 'Starting with sunset at N Seoul Tower, then Banpo Bridge Rainbow Fountain, DDP night illumination, Naksan Park fortress trail views, and Itaewon rooftop bars. AI designed the perfect time-based route to enjoy Seoul\'s most beautiful nights.'}
              </p>
            </div>
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
