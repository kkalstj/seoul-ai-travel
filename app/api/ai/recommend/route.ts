import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Supabase에서 장소 데이터를 가져와 프롬프트용 텍스트로 변환
async function getPlacesContext() {
  const [restaurants, accommodations, attractions, stations] = await Promise.all([
    supabase
      .from('restaurants')
      .select('id, name, food_type, address, rating, review_count, description')
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(100),
    supabase
      .from('accommodations')
      .select('id, name, accommodation_type, address, rating')
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(50),
    supabase
      .from('attractions')
      .select('id, name, category, description, address')
      .limit(100),
    supabase
      .from('subway_stations')
      .select('station_name, line_numbers')
      .limit(50),
  ]);

  const restaurantText = (restaurants.data || [])
    .map(
      (r: any) =>
        `[음식점] ${r.name} | ${r.food_type || '기타'} | 평점:${r.rating || '없음'} | 리뷰:${r.review_count || 0} | ${r.address || ''} | ${r.description || ''}`
    )
    .join('\n');

  const accommodationText = (accommodations.data || [])
    .map(
      (a: any) =>
        `[숙소] ${a.name} | ${a.accommodation_type || '기타'} | 평점:${a.rating || '없음'} | ${a.address || ''}`
    )
    .join('\n');

  const attractionText = (attractions.data || [])
    .map(
      (a: any) =>
        `[관광지] ${a.name} | ${a.category || '기타'} | ${a.description || ''} | ${a.address || ''}`
    )
    .join('\n');

  const stationText = (stations.data || [])
    .map((s: any) => `${s.station_name} (${s.line_numbers || ''})`)
    .join(', ');

  return `
=== 서울 음식점 (평점순 상위 100개) ===
${restaurantText}

=== 서울 숙소 (평점순 상위 50개) ===
${accommodationText}

=== 서울 관광지 (상위 100개) ===
${attractionText}

=== 주요 지하철역 ===
${stationText}
`.trim();
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      );
    }

    // 장소 데이터 가져오기
    const placesContext = await getPlacesContext();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = `당신은 친절하고 전문적인 서울 여행 AI 가이드 "서울메이트"입니다.

## 역할
- 사용자의 여행 스타일, 예산, 일정에 맞는 최적의 서울 여행 코스를 추천합니다.
- 실제 데이터에 기반한 장소만 추천합니다.
- 한국어로 친근하게 대화합니다.

## 보유 데이터
아래는 추천에 사용할 수 있는 실제 서울 장소 데이터입니다:
${placesContext}

## 🚨 핵심 규칙 - 반드시 구체적으로 추천하세요!
1. **구체적인 장소명**: "유명한 한식당" 같은 모호한 표현 금지. 반드시 위 데이터에 있는 정확한 장소명을 사용하세요.
2. **숙소 필수 포함**: 1박 이상의 여행이면 반드시 구체적인 숙소(호텔명)를 추천하세요.
3. **식사 시간마다 음식점 지정**: 아침/점심/저녁 각각 구체적인 음식점 이름을 추천하세요. "근처에서 식사" 같은 모호한 표현 금지.
4. **시간 구체적 배정**: 각 장소의 방문 시간과 체류 시간을 구체적으로 지정하세요.
5. **이동 정보 포함**: tip에 "도보 10분" 또는 "지하철 2호선 → 3호선 환승, 약 20분" 같은 이동 방법을 포함하세요.
6. **추천 이유 설명**: 각 장소를 왜 추천하는지 tip에 구체적으로 설명하세요 (평점, 추천 메뉴, 분위기 등).

## 코스 구성 원칙
- 아침(8-9시): 조식 또는 브런치 음식점
- 오전(10-12시): 관광지 1~2곳
- 점심(12-13시): 구체적인 점심 음식점
- 오후(14-17시): 관광지 1~2곳
- 저녁(18-19시): 구체적인 저녁 음식점
- 야간(20시~): 야경 명소 또는 카페
- 숙소: 구체적인 호텔/숙소명 + 체크인 시간

## 코스 추천 시 JSON 형식 (반드시 \`\`\`json 코드블록 안에):
{
  "itinerary": {
    "title": "코스 제목",
    "description": "코스 한줄 설명",
    "days": [
      {
        "day": 1,
        "theme": "테마 (예: 전통과 현대의 조화)",
        "places": [
          {
            "name": "정확한 장소명 (데이터에 있는 이름 그대로)",
            "type": "restaurant 또는 accommodation 또는 attraction",
            "time": "09:00",
            "duration": "1시간 30분",
            "tip": "추천 메뉴: 된장찌개(8,000원). 평점 4.5. 이전 장소에서 도보 5분 거리."
          }
        ]
      }
    ]
  }
}

## 나쁜 예시 (이렇게 하지 마세요 ❌)
- "서울의 유명한 한식당에서 점심" → ❌ 구체적 장소명 없음
- "호텔에서 휴식" → ❌ 어떤 호텔인지 불명확
- "근처 카페에서 커피" → ❌ 카페 이름 없음

## 좋은 예시 (이렇게 해주세요 ✅)
- "name": "을지로골뱅이", "tip": "추천 메뉴: 골뱅이무침. 평점 4.3. 을지로입구역 3번 출구에서 도보 3분."
- "name": "노보텔 앰배서더 동대문", "tip": "체크인 15시. 동대문 DDP 도보 5분 거리. 평점 4.2."
- "name": "경복궁", "tip": "한복 입으면 무료 입장. 광화문역 5번 출구. 소요시간 약 2시간 추천."

## 대화 스타일
- 이모지를 적절히 사용하세요 (🗼🍽️🏛️ 등)
- 첫 인사 시: 여행 목적, 일정, 인원, 선호를 물어보세요
- 추천 시: 왜 이 장소를 추천하는지 이유도 설명하세요
- JSON 일정 외에도 각 장소에 대한 친근한 설명을 텍스트로 함께 작성하세요
- 사용자가 수정을 요청하면 유연하게 대응하세요`;

    // 대화 기록 구성
    const chatHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: '시스템 설정: ' + systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: '네, 서울 여행 AI 가이드 "서울메이트"로서 도움을 드리겠습니다! 위 데이터를 기반으로 최적의 여행 코스를 추천해드릴게요.' }],
        },
        ...chatHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('AI 추천 에러:', error);
    return NextResponse.json(
      { error: error.message || 'AI 응답 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}