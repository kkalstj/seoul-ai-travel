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

// 음식점 주요 카테고리 (상위 15개만 필터로 노출)
export const FOOD_TYPES = [
  { value: '한식', label: '🍚 한식' },
  { value: '일식', label: '🍣 일식' },
  { value: '중국식', label: '🥟 중식' },
  { value: '경양식', label: '🍝 경양식' },
  { value: '분식', label: '🍜 분식' },
  { value: '호프/통닭', label: '🍺 호프/통닭' },
  { value: '통닭(치킨)', label: '🍗 치킨' },
  { value: '식육(숯불구이)', label: '🥩 숯불구이' },
  { value: '횟집', label: '🐟 횟집' },
  { value: '까페', label: '☕ 카페' },
  { value: '외국음식전문점(인도,태국등)', label: '🌶️ 외국음식' },
  { value: '패스트푸드', label: '🍔 패스트푸드' },
  { value: '뷔페식', label: '🍽️ 뷔페' },
  { value: '김밥(도시락)', label: '🍱 김밥/도시락' },
  { value: '냉면집', label: '🍲 냉면' },
] as const;

// 숙소 타입
export const ACCOMMODATION_TYPES = [
  { value: '관광호텔', label: '🏨 관광호텔' },
  { value: '일반호텔', label: '🏢 일반호텔' },
  { value: '숙박업(생활)', label: '🏠 생활숙박' },
  { value: '숙박업 기타', label: '🛏️ 기타숙박' },
  { value: '휴양콘도미니엄업', label: '🏖️ 콘도' },
] as const;

// 탭 정의
export const EXPLORE_TABS = [
  { key: 'restaurant', label: '🍽️ 음식점', color: 'orange' },
  { key: 'accommodation', label: '🏨 숙소', color: 'teal' },
  { key: 'attraction', label: '🏛️ 관광지', color: 'purple' },
] as const;

// 페이지당 아이템 수
export const PAGE_SIZE = 20;