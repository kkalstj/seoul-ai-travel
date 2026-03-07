'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Heart, MessageCircle, MapPin, Clock, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ArticleDetailPage() {
  var { locale } = useLanguage();
  var { user } = useAuth();
  var params = useParams();
  var router = useRouter();
  var articleId = params.id as string;

  var [article, setArticle] = useState<any>(null);
  var [loading, setLoading] = useState(true);
  var [saving, setSaving] = useState(false);
  var [saved, setSaved] = useState(false);

  var labels: Record<string, Record<string, string>> = {
    back: { ko: '뒤로', en: 'Back', ja: '戻る', zh: '返回' },
    aiCourse: { ko: 'AI 추천 코스', en: 'AI Recommended Course', ja: 'AIおすすめコース', zh: 'AI推荐路线' },
    chatWithAi: { ko: '이 주제로 AI와 대화하기', en: 'Chat with AI about this', ja: 'このテーマでAIと会話', zh: '就此主题与AI对话' },
    saveToTrip: { ko: '내 여행에 저장', en: 'Save to My Trip', ja: 'マイトリップに保存', zh: '保存到我的旅行' },
    saved: { ko: '저장됨!', en: 'Saved!', ja: '保存済み！', zh: '已保存！' },
    loginRequired: { ko: '로그인이 필요합니다', en: 'Login required', ja: 'ログインが必要です', zh: '需要登录' },
    notFound: { ko: '아티클을 찾을 수 없습니다', en: 'Article not found', ja: '記事が見つかりません', zh: '未找到文章' },
    generatedBy: { ko: 'AI가 생성한 여행 가이드', en: 'AI-Generated Travel Guide', ja: 'AI生成旅行ガイド', zh: 'AI生成旅行指南' },
  };

  useEffect(function() {
    loadArticle();
  }, [articleId]);

  async function loadArticle() {
    try {
      var { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) throw error;
      setArticle(data);
    } catch (err) {
      console.error('아티클 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveToTrip() {
    if (!user) {
      alert(labels.loginRequired[locale]);
      router.push('/auth');
      return;
    }
    if (!article) return;

    setSaving(true);
    try {
      // 코스 생성
      var { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          user_id: user.id,
          title: article.title,
          description: article.summary,
          share_id: crypto.randomUUID(),
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // content에서 장소 정보 파싱 시도
      if (article.content) {
        var lines = article.content.split('\n');
        var orderIndex = 0;
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          // "📍 장소명" 또는 "🍜 장소명" 패턴 찾기
          if (line.match(/^[🏛️📍🍜☕🌸🌃🎭🚶🏨🗼🎪🛍️🌊⛪🏰]/)) {
            var placeName = line.replace(/^[^\s]+\s*/, '').replace(/\s*[-–—].*$/, '').trim();
            if (placeName) {
              await supabase.from('course_places').insert({
                course_id: course.id,
                place_type: 'attraction',
                place_name: placeName,
                day_number: 1,
                order_index: orderIndex,
              });
              orderIndex++;
            }
          }
        }
      }

      setSaved(true);
      setTimeout(function() {
        router.push('/my-trip/' + course.id);
      }, 1000);
    } catch (err) {
      console.error('저장 실패:', err);
    } finally {
      setSaving(false);
    }
  }

  function handleChatWithAi() {
    var prompt = article.prompt || article.title;
    // AI 추천 페이지로 이동하면서 프롬프트 전달
    router.push('/ai-recommend?prompt=' + encodeURIComponent(prompt));
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

      {/* 상세 내용 */}
      {article.content && (
        <div className="bg-white rounded-2xl border p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-gray-900">{labels.aiCourse[locale]}</h2>
          </div>
          <div className="prose prose-sm max-w-none">
            {article.content.split('\n').map(function(line: string, i: number) {
              var trimmed = line.trim();
              if (!trimmed) return <div key={i} className="h-3" />;

              // 헤더 (## 또는 **텍스트**)
              if (trimmed.startsWith('## ')) {
                return <h3 key={i} className="text-lg font-bold text-gray-900 mt-4 mb-2">{trimmed.replace('## ', '')}</h3>;
              }
              if (trimmed.startsWith('### ')) {
                return <h4 key={i} className="font-bold text-gray-800 mt-3 mb-1">{trimmed.replace('### ', '')}</h4>;
              }

              // 장소 라인 (이모지로 시작)
              if (trimmed.match(/^[🏛️📍🍜☕🌸🌃🎭🚶🏨🗼🎪🛍️🌊⛪🏰🌳🎨🍽️🚇]/)) {
                return (
                  <div key={i} className="flex items-start gap-2 py-2 px-3 bg-blue-50 rounded-xl my-1.5">
                    <span className="text-lg shrink-0">{trimmed.charAt(0) === ' ' ? trimmed.charAt(1) : trimmed.split(' ')[0]}</span>
                    <p className="text-sm text-gray-700 font-medium">{trimmed.replace(/^[^\s]+\s*/, '')}</p>
                  </div>
                );
              }

              // 팁 라인
              if (trimmed.startsWith('💡') || trimmed.startsWith('✅') || trimmed.startsWith('⏰')) {
                return (
                  <div key={i} className="flex items-start gap-2 py-1.5 px-3 bg-amber-50 rounded-lg my-1">
                    <p className="text-sm text-amber-700">{trimmed}</p>
                  </div>
                );
              }

              // 일반 텍스트
              return <p key={i} className="text-sm text-gray-600 leading-relaxed my-1">{trimmed}</p>;
            })}
          </div>
        </div>
      )}

      {/* 액션 버튼들 */}
      <div className="space-y-3 mb-8">
        <button
          onClick={handleChatWithAi}
          className="flex items-center justify-between w-full p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition group"
        >
          <div className="flex items-center gap-3">
            <MessageCircle size={20} />
            <span className="font-medium">{labels.chatWithAi[locale]}</span>
          </div>
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={handleSaveToTrip}
          disabled={saving || saved}
          className={'flex items-center justify-between w-full p-4 rounded-2xl transition group border ' +
            (saved ? 'bg-green-50 border-green-200 text-green-600' :
             'bg-white hover:bg-gray-50 text-gray-700')}
        >
          <div className="flex items-center gap-3">
            <Heart size={20} className={saved ? 'fill-green-500 text-green-500' : ''} />
            <span className="font-medium">
              {saved ? labels.saved[locale] : saving ? '...' : labels.saveToTrip[locale]}
            </span>
          </div>
          {!saved && <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />}
        </button>
      </div>
    </div>
  );
}
