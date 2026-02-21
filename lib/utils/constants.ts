// 서울 중심 좌표 (시청)
export const SEOUL_CENTER = {
  lat: 37.5665,
  lng: 126.978,
};

export const DEFAULT_ZOOM = 13;

// 장소 타입별 색상
export const PLACE_COLORS = {
  restaurant: '#FF6B35',
  accommodation: '#4ECDC4',
  attraction: '#7B68EE',
  subway: '#45B7D1',
} as const;

export const PLACE_LABELS = {
  restaurant: '음식점',
  accommodation: '숙소',
  attraction: '관광지',
  subway: '지하철',
} as const;

// 음식점 주요 카테고리
export const FOOD_TYPES = [
  { value: '한식', labelKey: 'food.korean' },
  { value: '일식', labelKey: 'food.japanese' },
  { value: '중국식', labelKey: 'food.chinese' },
  { value: '경양식', labelKey: 'food.western' },
  { value: '분식', labelKey: 'food.snack' },
  { value: '호프/통닭', labelKey: 'food.pub' },
  { value: '통닭(치킨)', labelKey: 'food.chicken' },
  { value: '식육(숯불구이)', labelKey: 'food.bbq' },
  { value: '횟집', labelKey: 'food.sashimi' },
  { value: '까페', labelKey: 'food.cafe' },
  { value: '외국음식전문점(인도,태국등)', labelKey: 'food.foreign' },
  { value: '패스트푸드', labelKey: 'food.fastfood' },
  { value: '뷔페식', labelKey: 'food.buffet' },
  { value: '김밥(도시락)', labelKey: 'food.kimbap' },
  { value: '냉면집', labelKey: 'food.naengmyeon' },
] as const;

// 숙소 타입
export const ACCOMMODATION_TYPES = [
  { value: '관광호텔', labelKey: 'accom.tourist' },
  { value: '일반호텔', labelKey: 'accom.general' },
  { value: '숙박업(생활)', labelKey: 'accom.living' },
  { value: '숙박업 기타', labelKey: 'accom.other' },
  { value: '휴양콘도미니엄업', labelKey: 'accom.condo' },
] as const;

// 탭 정의
export const EXPLORE_TABS = [
  { key: 'restaurant', label: '🍽️ 음식점', color: 'orange' },
  { key: 'accommodation', label: '🏨 숙소', color: 'teal' },
  { key: 'attraction', label: '🏛️ 관광지', color: 'purple' },
] as const;

// 페이지당 아이템 수
export const PAGE_SIZE = 20;
