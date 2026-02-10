export interface Restaurant {
  id: string;
  name: string;
  food_type: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  review_count: number | null;
  description: string | null;
  created_at: string | null;
}

export interface Accommodation {
  id: string;
  name: string;
  accommodation_type: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  created_at: string | null;
}

export interface Attraction {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
}

export interface SubwayStation {
  id: string;
  station_name: string;
  line_numbers: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
}

// 통합 장소 타입 (지도 마커, AI 추천용)
export type PlaceType = 'restaurant' | 'accommodation' | 'attraction' | 'subway';

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  address: string | null;
  latitude: number;
  longitude: number;
  rating?: number | null;
  category?: string | null;
  description?: string | null;
}