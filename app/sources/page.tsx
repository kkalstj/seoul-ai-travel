'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ArrowLeft, Database, Map, Cloud, Sparkles, Calendar, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SourcesPage() {
  var { locale } = useLanguage();
  var router = useRouter();

  var labels: Record<string, Record<string, string>> = {
    title: { ko: '데이터 출처', en: 'Data Sources', ja: 'データ出典', zh: '数据来源' },
    subtitle: { ko: '본 서비스에서 사용하는 데이터의 출처를 안내합니다.', en: 'Information about data sources used in this service.', ja: '本サービスで使用するデータの出典をご案内します。', zh: '本服务使用的数据来源说明。' },
    disclaimer: { ko: 'AI가 생성한 콘텐츠(아티클, 여행 코스 추천 등)는 참고용이며, 실제 정보와 다를 수 있습니다. 방문 전 직접 확인하시기 바랍니다.', en: 'AI-generated content (articles, travel course recommendations, etc.) is for reference only and may differ from actual information. Please verify before visiting.', ja: 'AIが生成したコンテンツ（記事、旅行コース推薦など）は参考用であり、実際の情報と異なる場合があります。訪問前にご自身で確認してください。', zh: 'AI生成的内容（文章、旅行路线推荐等）仅供参考，可能与实际信息有所不同。请在访问前自行确认。' },
    back: { ko: '뒤로', en: 'Back', ja: '戻る', zh: '返回' },
  };

  var sources = [
    {
      icon: Database,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      title: { ko: '서울 관광 데이터', en: 'Seoul Tourism Data', ja: 'ソウル観光データ', zh: '首尔旅游数据' },
      description: { ko: '음식점, 숙소, 관광지 정보', en: 'Restaurant, accommodation, and attraction information', ja: 'レストラン、宿泊施設、観光地情報', zh: '餐厅、住宿、景点信息' },
      source: { ko: '서울열린데이터광장, 한국관광공사', en: 'Seoul Open Data Plaza, Korea Tourism Organization', ja: 'ソウルオープンデータ広場、韓国観光公社', zh: '首尔开放数据广场、韩国观光公社' },
      url: 'https://data.seoul.go.kr',
    },
    {
      icon: Cloud,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      title: { ko: '날씨 정보', en: 'Weather Information', ja: '天気情報', zh: '天气信息' },
      description: { ko: '현재 날씨 및 주간 예보', en: 'Current weather and weekly forecast', ja: '現在の天気と週間予報', zh: '当前天气和每周预报' },
      source: { ko: '기상청 공공데이터 API', en: 'Korea Meteorological Administration Public API', ja: '気象庁公共データAPI', zh: '气象厅公共数据API' },
      url: 'https://data.kma.go.kr',
    },
    {
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      title: { ko: '서울 행사 정보', en: 'Seoul Event Information', ja: 'ソウルイベント情報', zh: '首尔活动信息' },
      description: { ko: '축제, 전시, 공연 등 행사 일정', en: 'Festival, exhibition, and performance schedules', ja: '祭り、展示、公演などのイベント日程', zh: '节日、展览、演出等活动日程' },
      source: { ko: '서울특별시 문화행사 API', en: 'Seoul Metropolitan Government Cultural Events API', ja: 'ソウル特別市文化行事API', zh: '首尔特别市文化活动API' },
      url: 'https://data.seoul.go.kr',
    },
    {
      icon: Map,
      color: 'text-green-600',
      bg: 'bg-green-50',
      title: { ko: '지도 및 경로', en: 'Maps and Routes', ja: '地図とルート', zh: '地图和路线' },
      description: { ko: '지도 표시, 경로 안내, 대중교통 정보', en: 'Map display, route guidance, and transit information', ja: '地図表示、ルート案内、公共交通情報', zh: '地图显示、路线导航、公共交通信息' },
      source: 'Google Maps Platform',
      url: 'https://developers.google.com/maps',
    },
    {
      icon: Sparkles,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      title: { ko: 'AI 추천 및 아티클', en: 'AI Recommendations & Articles', ja: 'AIおすすめと記事', zh: 'AI推荐和文章' },
      description: { ko: '여행 코스 추천, AI 아티클 생성', en: 'Travel course recommendations, AI article generation', ja: '旅行コース推薦、AI記事生成', zh: '旅行路线推荐、AI文章生成' },
      source: 'Google Gemini AI',
      url: 'https://ai.google.dev',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={function() { router.back(); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} />
        {labels.back[locale]}
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">{labels.title[locale]}</h1>
      <p className="text-sm text-gray-400 mb-8">{labels.subtitle[locale]}</p>

      <div className="space-y-4 mb-8">
        {sources.map(function(src, i) {
          var Icon = src.icon;
          var title = typeof src.title === 'string' ? src.title : (src.title[locale] || src.title['ko']);
          var desc = typeof src.description === 'string' ? src.description : (src.description[locale] || src.description['ko']);
          var sourceName = typeof src.source === 'string' ? src.source : (src.source[locale] || src.source['ko']);

          return (
            <div key={i} className="bg-white rounded-2xl border p-4 hover:shadow-sm transition">
              <div className="flex items-start gap-3">
                <div className={'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ' + src.bg}>
                  <Icon className={'w-5 h-5 ' + src.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs text-blue-600 font-medium">{sourceName}</span>
                    {src.url && (
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500">
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI 면책 문구 */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <p className="text-sm text-amber-700 leading-relaxed">
          ⚠️ {labels.disclaimer[locale]}
        </p>
      </div>
    </div>
  );
}
