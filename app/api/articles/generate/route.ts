import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

var locales = ['ko', 'en', 'ja', 'zh'];

var localeConfig: Record<string, { instruction: string }> = {
  ko: { instruction: '한국어로 작성하세요.' },
  en: { instruction: 'Write in English.' },
  ja: { instruction: '日本語で作成してください。' },
  zh: { instruction: '用中文撰写。' },
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
    var authHeader = request.headers.get('authorization');
    if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    var season = getSeason();
    var month = new Date().getMonth() + 1;
    var model = genAI.getGenerativeModel({
  model: 'gemini-3-flash-preview',
  tools: [{ googleSearch: {} }],
});
    
    // 기존 아티클 삭제
    await supabase.from('articles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    for (var li = 0; li < locales.length; li++) {
      if (li > 0) {
        await new Promise(function(resolve) { setTimeout(resolve, 5000); });
      }

      var locale = locales[li];
      var config = localeConfig[locale];
      var seasonName = getSeasonName(season, locale);

      var prompt = `당신은 서울 여행 콘텐츠 전문 작가입니다. 최신 트렌드를 항상 반영합니다.
${config.instruction}

현재 월: ${month}월, 계절: ${seasonName}

중요: Google 검색을 활용하여 서울의 최신 여행 트렌드, 화제의 맛집, 인기 TV 프로그램 관련 장소, 최근 음식 축제, 미슐랭 선정 식당, 요즘 뜨는 핫플레이스를 조사하세요.

서울 여행 아티클 4개를 생성하세요.
각 아티클은 반드시 최신 트렌드를 반영하고, 현재 계절, 날씨에 적합해야 합니다.

아래 트렌드 주제를 검색하여 반영하세요:
- 최근 미슐랭 가이드 서울 선정 식당
- 블루리본 서베이를 통해 선발된 맛집
- 한국 TV 프로그램에 나온 화제의 맛집
- 현재 진행 중이거나 예정된 서울 축제 및 행사
- 최근 오픈한 인기 카페, 맛집, 관광지
- 요즘 인스타그램/틱톡에서 뜨는 서울 핫플레이스
- 이번 달에 즐길 수 있는 계절 활동
- 현재 인기 있는 최신 K-드라마 촬영지 (지상파 및 넷플릭스, 디즈니플러스 등 등)
- 서울 최신 음식 트렌드 (유행 메뉴, 팝업스토어)

클래식 테마도 고려하세요:
- 계절 명소 (벚꽃, 단풍, 눈, 여름 축제)
- 비 오는 날 실내 코스
- 야경 코스
- 역사/문화 탐방

각 아티클에 아래 항목을 포함하세요:
1. category: 짧은 카테고리 라벨 (2~4단어)
2. title: 트렌드를 반영한 매력적인 제목 (25자 이내)
3. summary: 3~4문장 요약 (100~150자). 구체적인 트렌드 장소명을 포함하세요.
4. content: 상세 아티클 (300~500자). 구체적인 서울 장소를 포함하고 아래 이모지를 사용하세요:
   📍 장소명 - 설명
   🍜 식당명 - 추천 메뉴
   ☕ 카페명 - 설명
   🚇 장소 간 이동 정보
   💡 꿀팁
5. prompt: 이 아티클의 제목, 핵심 장소, 테마를 포함한 상세 요청문. AI 여행 플래너가 이 아티클과 일치하는 코스를 생성할 수 있도록 충분한 정보를 담으세요. 형식: "[아티클 테마]에 맞는 코스를 추천해주세요. [아티클에 언급된 핵심 장소들]을 포함해주세요."

prompt 항목이 매우 중요합니다. 별도의 AI가 이 prompt를 받아서 아티클 내용과 정확히 일치하는 여행 코스를 생성할 수 있어야 합니다.

반드시 JSON 배열로만 응답하세요. 마크다운이나 백틱 없이:
[
  {
     "emoji": "주제에 맞는 이모지 1개 (예: 🌸, 🍜, 🌃, 🏛️, ☕, 🎭, 🛍️, 🌧️, 🚶, 🎪, ❄️, 🌊 등)",
    "category": "...",
    "title": "...",
    "summary": "...",
    "content": "...",
    "prompt": "..."
  }
]`;

      var result = await model.generateContent(prompt);
      var text = result.response.text().trim();
      var cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      var articles = JSON.parse(cleanText);

      for (var ai = 0; ai < articles.length && ai < 4; ai++) {
        var style = stylePresets[ai % stylePresets.length];
        await supabase.from('articles').insert({
          locale: locale,
          emoji: articles[ai].emoji || style.emoji,
          category: articles[ai].category,
          title: articles[ai].title,
          summary: articles[ai].summary,
          content: articles[ai].content,
          prompt: articles[ai].prompt,
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
