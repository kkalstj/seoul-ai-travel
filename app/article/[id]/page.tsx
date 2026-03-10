'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { createClient } from '@supabase/supabase-js';
import ItineraryCard from '@/components/ai/ItineraryCard';
import ItineraryMap from '@/components/ai/ItineraryMap';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function loadGoogleMaps(): Promise<void> {
  return new Promise(function(resolve, reject) {
    if ((window as any).google && (window as any).google.maps) {
      resolve();
      return;
    }
    var existing = document.getElementById('google-maps-script');
    if (existing) {
      existing.addEventListener('load', function() { resolve(); });
      return;
    }
    var script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY + '&libraries=places';
    script.async = true;
    script.defer = true;
    script.onload = function() { resolve(); };
    script.onerror = function() { reject(new Error('Google Maps load failed')); };
    document.head.appendChild(script);
  });
}

export default function ArticleDetailPage() {
  var { locale } = useLanguage();
  var params = useParams();
  var router = useRouter();
  var articleId = params.id as string;

  var [article, setArticle] = useState<any>(null);
  var [loading, setLoading] = useState(true);
  var [itinerary, setItinerary] = useState<any>(null);
  var [generating, setGenerating] = useState(false);
  var [error, setError] = useState('');
  var [transitInfo, setTransitInfo] = useState<any[]>([]);
  var [transitLoading, setTransitLoading] = useState(false);

  var labels: Record<string, Record<string, string>> = {
    back: { ko: '뒤로', en: 'Back', ja: '戻る', zh: '返回' },
    generatedBy: { ko: 'AI가 생성한 여행 가이드', en: 'AI-Generated Travel Guide', ja: 'AI生成旅行ガイド', zh: 'AI生成旅行指南' },
    generating: { ko: 'AI가 맞춤 코스를 만들고 있어요...', en: 'AI is creating a custom course...', ja: 'AIがコースを作成中...', zh: 'AI正在创建路线...' },
    notFound: { ko: '아티클을 찾을 수 없습니다', en: 'Article not found', ja: '記事が見つかりません', zh: '未找到文章' },
    error: { ko: '코스 생성에 실패했습니다. 다시 시도해주세요.', en: 'Failed to generate course. Please try again.', ja: 'コース生成に失敗しました。再度お試しください。', zh: '路线生成失败，请重试。' },
    retry: { ko: '다시 시도', en: 'Retry', ja: '再試行', zh: '重试' },
    transitTitle: { ko: '대중교통 이동 정보', en: 'Transit Information', ja: '公共交通情報', zh: '公共交通信息' },
    transitLoading: { ko: '대중교통 정보를 불러오는 중...', en: 'Loading transit info...', ja: '交通情報を読み込み中...', zh: '正在加载交通信息...' },
    walking: { ko: '도보 이동', en: 'Walking', ja: '徒歩移動', zh: '步行' },
    noRoute: { ko: '경로 정보 없음', en: 'No route info', ja: 'ルート情報なし', zh: '无路线信息' },
    stops: { ko: '정거장', en: ' stops', ja: '駅', zh: '站' },
  };

  useEffect(function() {
    loadArticle();
  }, [articleId]);

  useEffect(function() {
    if (!itinerary) return;
    calculateTransit(itinerary);
  }, [itinerary]);

  async function calculateTransit(itineraryData: any) {
    setTransitLoading(true);
    try {
      await loadGoogleMaps();
      var google = (window as any).google;
      if (!google) return;

      var allPlaces: { name: string; type: string }[] = [];
      itineraryData.days.forEach(function(day: any) {
        day.places.forEach(function(place: any) {
          allPlaces.push({ name: place.name.replace(/\s*\(.*?\)\s*/g, '').trim(), type: place.type || 'attraction' });
        });
      });

      var coords: { lat: number; lng: number; name: string }[] = [];
      for (var i = 0; i < allPlaces.length; i++) {
        var place = allPlaces[i];
        var found = false;

        var tables = ['restaurants', 'accommodations', 'attractions'];
        for (var t = 0; t < tables.length; t++) {
          var { data } = await supabase
            .from(tables[t])
            .select('name, latitude, longitude')
            .ilike('name', '%' + place.name + '%')
            .limit(1);

          if (data && data.length > 0 && data[0].latitude && data[0].longitude) {
            coords.push({ lat: data[0].latitude, lng: data[0].longitude, name: place.name });
            found = true;
            break;
          }
        }

        if (!found) {
          try {
            var geocoder = new google.maps.Geocoder();
            var result = await new Promise(function(resolve, reject) {
              geocoder.geocode({ address: place.name + ' 서울' }, function(results: any, status: any) {
                if (status === 'OK' && results.length > 0) resolve(results[0]);
                else reject(new Error('Geocode failed'));
              });
            }) as any;
            coords.push({ lat: result.geometry.location.lat(), lng: result.geometry.location.lng(), name: place.name });
          } catch (geoErr) {
            console.error('Geocode error:', place.name);
          }
        }
      }

      if (coords.length < 2) {
        setTransitLoading(false);
        return;
      }

      var directionsService = new google.maps.DirectionsService();
      var totalSegments = coords.length - 1;
      var infoResults: any[] = new Array(totalSegments).fill(null);
      var completed = 0;

      for (var j = 0; j < coords.length - 1; j++) {
        (function(origin, destination, index) {
          directionsService.route(
            {
              origin: new google.maps.LatLng(origin.lat, origin.lng),
              destination: new google.maps.LatLng(destination.lat, destination.lng),
              travelMode: google.maps.TravelMode.TRANSIT,
              region: 'kr',
            },
            function(result: any, status: any) {
              if (status === 'OK') {
                var leg = result.routes[0].legs[0];
                var steps = leg.steps || [];
                var transitSteps: any[] = [];

                steps.forEach(function(step: any) {
                  if (step.travel_mode === 'TRANSIT') {
                    var line = step.transit.line;
                    transitSteps.push({
                      vehicle: line.vehicle.type,
                      name: line.short_name || line.name,
                      color: line.color || '#4285F4',
                      textColor: line.text_color || '#FFFFFF',
                      numStops: step.transit.num_stops,
                      departure: step.transit.departure_stop.name,
                      arrival: step.transit.arrival_stop.name,
                    });
                  }
                });

                infoResults[index] = {
                  from: origin.name,
                  to: destination.name,
                  duration: leg.duration.text,
                  distance: leg.distance.text,
                  steps: transitSteps,
                };
              } else {
                infoResults[index] = {
                  from: origin.name,
                  to: destination.name,
                  duration: null,
                  distance: null,
                  steps: [],
                };
              }

              completed++;
              if (completed === totalSegments) {
                setTransitInfo(infoResults);
                setTransitLoading(false);
              }
            }
          );
        })(coords[j], coords[j + 1], j);
      }
    } catch (err) {
      console.error('Transit calculation error:', err);
      setTransitLoading(false);
    }
  }

  async function loadArticle() {
    try {
      var { data, error: fetchError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (fetchError) throw fetchError;
      setArticle(data);

      if (data) {
        generateCourse(data);
      }
    } catch (err) {
      console.error('아티클 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }

  async function generateCourse(articleData: any) {
    setGenerating(true);
    setError('');

    try {
      var message = articleData.prompt || articleData.title;

      var response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          history: [],
          locale: locale,
        }),
      });

      if (!response.ok) throw new Error('AI 응답 실패');

      var data = await response.json();
      var content = data.response || '';

      var jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        var parsed = JSON.parse(jsonMatch[1]);
        if (parsed.itinerary) {
          setItinerary(parsed.itinerary);
        }
      }
    } catch (err: any) {
      console.error('코스 생성 실패:', err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{labels.notFound[locale]}</p>
        <button onClick={function() { router.push('/'); }} className="text-blue-600 text-sm mt-2 hover:underline">
          {labels.back[locale]}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={function() { router.back(); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft size={20} />
        </button>
        <span className="text-xs text-gray-400">{labels.generatedBy[locale]}</span>
      </div>

      {/* 아티클 헤더 */}
      <div className="mb-6">
        <div className={'w-full h-48 rounded-2xl bg-gradient-to-br flex items-center justify-center text-6xl mb-4 ' + article.color_from + ' ' + article.color_to}>
          {article.emoji}
        </div>
        <span className={'inline-block text-xs px-2.5 py-1 rounded-full font-medium mb-2 ' + article.badge_bg + ' ' + article.badge_text}>
          {article.category}
        </span>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{article.title}</h1>
        <p className="text-gray-500 leading-relaxed">{article.summary}</p>
      </div>

      {/* AI 코스 생성 중 */}
      {generating && (
        <div className="bg-white rounded-2xl border p-8 mb-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900 mb-1">{labels.generating[locale]}</p>
              <div className="flex items-center gap-1.5 justify-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 에러 */}
      {error && !generating && (
        <div className="bg-red-50 rounded-2xl border border-red-100 p-6 mb-6 text-center">
          <p className="text-red-600 text-sm mb-3">{labels.error[locale]}</p>
          <button
            onClick={function() { generateCourse(article); }}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
          >
            {labels.retry[locale]}
          </button>
        </div>
      )}

      {/* AI 생성 코스 */}
      {itinerary && !generating && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-gray-900">
              {locale === 'ko' ? 'AI 추천 코스' :
               locale === 'ja' ? 'AIおすすめコース' :
               locale === 'zh' ? 'AI推荐路线' :
               'AI Recommended Course'}
            </h2>
          </div>
          <ItineraryMap itinerary={itinerary} />

          {/* 대중교통 이동 정보 */}
          {transitLoading && (
            <div className="bg-white rounded-2xl border p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                {labels.transitLoading[locale]}
              </div>
            </div>
          )}

          {transitInfo.length > 0 && !transitLoading && (
            <div className="bg-white rounded-2xl border overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  🚇 {labels.transitTitle[locale]}
                </h3>
              </div>
              <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
                {transitInfo.map(function(info, idx) {
                  if (!info) return null;
                  return (
                    <div key={idx} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-700">
                          {info.from} → {info.to}
                        </span>
                        {info.duration && (
                          <span className="text-xs text-blue-600 font-semibold">{info.duration}</span>
                        )}
                      </div>
                      {info.steps.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {info.steps.map(function(step: any, si: number) {
                            var icon = step.vehicle === 'SUBWAY' ? '🚇' :
                                       step.vehicle === 'BUS' ? '🚌' :
                                       step.vehicle === 'HEAVY_RAIL' ? '🚆' : '🚍';
                            return (
                              <div key={si} className="flex items-center gap-1.5 text-xs flex-wrap">
                                <span
                                  className="px-2 py-0.5 rounded-full font-bold"
                                  style={{ backgroundColor: step.color, color: step.textColor }}
                                >
                                  {icon} {step.name}
                                </span>
                                <span className="text-gray-500">
                                  {step.departure} → {step.arrival}
                                </span>
                                <span className="text-gray-400">({step.numStops}{labels.stops[locale]})</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {info.duration ? labels.walking[locale] : labels.noRoute[locale]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <ItineraryCard itinerary={itinerary} />
        </div>
      )}
    </div>
  );
}
