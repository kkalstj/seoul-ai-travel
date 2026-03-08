'use client';

import { useEffect, useState } from 'react';
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

  var labels: Record<string, Record<string, string>> = {
    back: { ko: '뒤로', en: 'Back', ja: '戻る', zh: '返回' },
    generatedBy: { ko: 'AI가 생성한 여행 가이드', en: 'AI-Generated Travel Guide', ja: 'AI生成旅行ガイド', zh: 'AI生成旅行指南' },
    generating: { ko: 'AI가 맞춤 코스를 만들고 있어요...', en: 'AI is creating a custom course...', ja: 'AIがコースを作成中...', zh: 'AI正在创建路线...' },
    notFound: { ko: '아티클을 찾을 수 없습니다', en: 'Article not found', ja: '記事が見つかりません', zh: '未找到文章' },
    error: { ko: '코스 생성에 실패했습니다. 다시 시도해주세요.', en: 'Failed to generate course. Please try again.', ja: 'コース生成に失敗しました。再度お試しください。', zh: '路线生成失败，请重试。' },
    retry: { ko: '다시 시도', en: 'Retry', ja: '再試行', zh: '重试' },
  };

  useEffect(function() {
    loadArticle();
  }, [articleId]);

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
          <ItineraryCard itinerary={itinerary} />
        </div>
      )}
    </div>
  );
}
