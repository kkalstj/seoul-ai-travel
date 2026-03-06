import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

var locales = ['ko', 'en', 'ja', 'zh'];

var localeConfig: Record<string, { instruction: string; seasonLabel: string }> = {
  ko: {
    instruction: '한국어로 작성하세요.',
    seasonLabel: '계절',
  },
  en: {
    instruction: 'Write in English.',
    seasonLabel: 'season',
  },
  ja: {
    instruction: '日本語で作成してください。',
    seasonLabel: '季節',
  },
  zh: {
    instruction: '用中文撰写。',
    seasonLabel: '季节',
  },
};

function getSeason(): string {
  var month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function getSeasonName(season: string, locale: string): string {
  var names: Record<string, Record<string, string>> = {
    spring: { ko: '봄', en: 'Spring', ja: '春', zh: '春' },
    summer: { ko: '여름', en: 'Summer', ja: '夏', zh: '夏' },
    autumn: { ko: '가을', en: 'Autumn', ja: '秋', zh: '秋' },
    winter: { ko: '겨울', en: 'Winter', ja: '冬', zh: '冬' },
  };
  return names[season]?.[locale] || season;
}

var stylePresets = [
  { emoji: '🌸', color_from: 'from-pink-100', color_to: 'to-rose-200', badge_bg: 'bg-pink-50', badge_text: 'text-pink-600' },
  { emoji: '🌧️', color_from: 'from-blue-100', color_to: 'to-indigo-200', badge_bg: 'bg-blue-50', badge_text: 'text-blue-600' },
  { emoji: '🍜', color_from: 'from-amber-100', color_to: 'to-orange-200', badge_bg: 'bg-orange-50', badge_text: 'text-orange-600' },
  { emoji: '🌃', color_from: 'from-violet-100', color_to: 'to-purple-200', badge_bg: 'bg-purple-50', badge_text: 'text-purple-600' },
  { emoji: '🏛️', color_from: 'from-emerald-100', color_to: 'to-teal-200', badge_bg: 'bg-teal-50', badge_text: 'text-teal-600' },
  { emoji: '🎭', color_from: 'from-red-100', color_to: 'to-rose-200', badge_bg: 'bg-red-50', badge_text: 'text-red-600' },
  { emoji: '☕', color_from: 'from-yellow-100', color_to: 'to-amber-200', badge_bg: 'bg-amber-50', badge_text: 'text-amber-600' },
  { emoji: '🚶', color_from: 'from-green-100', color_to: 'to-emerald-200', badge_bg: 'bg-green-50', badge_text: 'text-green-600' },
];

export async function POST(request: NextRequest) {
  try {
    // 인증 확인 (Cron Job 또는 수동 호출)
    var authHeader = request.headers.get('authorization');
    if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    var season = getSeason();
    var month = new Date().getMonth() + 1;
    var model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // 기존 아티클 삭제
    await supabase.from('articles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    for (var li = 0; li < locales.length; li++) {
      var locale = locales[li];
      var config = localeConfig[locale];
      var seasonName = getSeasonName(season, locale);

      var prompt = `You are a Seoul travel content creator.
${config.instruction}

Current month: ${month}, Season: ${seasonName}

Generate exactly 4 travel article summaries for Seoul.
Each article should be unique and relevant to the current season/weather.

Consider these themes (pick 4 different ones):
- Seasonal attractions (cherry blossoms, autumn leaves, snow, summer festivals, etc.)
- Rainy day / indoor courses
- Local food tours / hidden gem restaurants
- Night view / evening courses
- Historical / cultural tours
- Shopping courses
- Family-friendly courses
- Solo travel courses
- Instagram-worthy photo spots
- K-culture experiences

Respond ONLY with a JSON array, no markdown, no backticks:
[
  {
    "category": "short category label (2-4 words)",
    "title": "compelling article title (under 30 chars)",
    "summary": "detailed 3-4 sentence summary (80-120 chars). Include specific Seoul place names and practical tips."
  }
]`;

      var result = await model.generateContent(prompt);
      var text = result.response.text().trim();

      // JSON 파싱
      var cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      var articles = JSON.parse(cleanText);

      // DB에 저장
      for (var ai = 0; ai < articles.length && ai < 4; ai++) {
        var style = stylePresets[ai % stylePresets.length];
        await supabase.from('articles').insert({
          locale: locale,
          emoji: style.emoji,
          category: articles[ai].category,
          title: articles[ai].title,
          summary: articles[ai].summary,
          color_from: style.color_from,
          color_to: style.color_to,
          badge_bg: style.badge_bg,
          badge_text: style.badge_text,
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Articles generated for all locales' });
  } catch (error: any) {
    console.error('Article generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
