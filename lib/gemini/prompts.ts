import type { Restaurant, Accommodation, Attraction } from '@/types/database';

// DB 데이터를 Gemini 프롬프트에 넣을 문자열로 변환
export function formatPlacesForPrompt(
  restaurants: Restaurant[],
  accommodations: Accommodation[],
  attractions: Attraction[]
): string {
  const restaurantText = restaurants
    .map(
      (r) =>
        `[음식점] id:${r.id} | ${r.name} | ${r.food_type || '기타'} | 평점:${r.rating || '없음'} | ${r.address || ''}`
    )
    .join('\n');

  const accommodationText = accommodations
    .map(
      (a) =>
        `[숙소] id:${a.id} | ${a.name} | ${a.accommodation_type || '기타'} | 평점:${a.rating || '없음'} | ${a.address || ''}`
    )
    .join('\n');

  const attractionText = attractions
    .map(
      (a) =>
        `[관광지] id:${a.id} | ${a.name} | ${a.category || '기타'} | ${a.description || ''} | ${a.address || ''}`
    )
    .join('\n');

  return `
=== 음식점 ===
${restaurantText}

=== 숙소 ===
${accommodationText}

=== 관광지 ===
${attractionText}
`.trim();
}

// 빠른 추천 프롬프트 템플릿
export const quickPrompts = {
  solo: '혼자 서울 여행 1일 코스를 추천해주세요. 관광지와 맛집을 적절히 섞어주세요.',
  couple: '커플 데이트 코스를 추천해주세요. 분위기 좋은 곳 위주로요.',
  family: '가족 여행 코스를 추천해주세요. 아이들이 좋아할 만한 곳 포함해주세요.',
  food: '서울 맛집 투어 코스를 추천해주세요. 다양한 음식을 맛볼 수 있게요.',
  history: '서울 역사 탐방 코스를 추천해주세요. 궁궐과 전통 문화 위주로요.',
  nightlife: '서울 야경 투어 코스를 추천해주세요. 저녁부터 밤까지요.',
};