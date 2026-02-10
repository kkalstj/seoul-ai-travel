import { supabase } from './client';
import type { Restaurant, Accommodation, Attraction, SubwayStation } from '@/types/database';

// 음식점 전체 조회
export async function getRestaurants(limit = 50) {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Restaurant[];
}

// 숙소 전체 조회
export async function getAccommodations(limit = 50) {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Accommodation[];
}

// 관광지 전체 조회
export async function getAttractions(limit = 50) {
  const { data, error } = await supabase
    .from('attractions')
    .select('*')
    .order('name', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data as Attraction[];
}

// 지하철역 전체 조회
export async function getSubwayStations() {
  const { data, error } = await supabase
    .from('subway_stations')
    .select('*')
    .order('station_name', { ascending: true });

  if (error) throw error;
  return data as SubwayStation[];
}

// 음식점 카테고리별 조회
export async function getRestaurantsByType(foodType: string) {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('food_type', foodType)
    .order('rating', { ascending: false });

  if (error) throw error;
  return data as Restaurant[];
}

// 통합 검색 (이름 기준)
export async function searchPlaces(keyword: string) {
  const [restaurants, accommodations, attractions] = await Promise.all([
    supabase
      .from('restaurants')
      .select('*')
      .ilike('name', `%${keyword}%`)
      .limit(10),
    supabase
      .from('accommodations')
      .select('*')
      .ilike('name', `%${keyword}%`)
      .limit(10),
    supabase
      .from('attractions')
      .select('*')
      .ilike('name', `%${keyword}%`)
      .limit(10),
  ]);

  return {
    restaurants: (restaurants.data || []) as Restaurant[],
    accommodations: (accommodations.data || []) as Accommodation[],
    attractions: (attractions.data || []) as Attraction[],
  };
}

// 특정 좌표 근처 음식점 조회 (거리 기반)
// Supabase에서 PostGIS 없이 간단하게 범위 필터링
export async function getNearbyRestaurants(
  lat: number,
  lng: number,
  radiusKm = 1
) {
  const latRange = radiusKm / 111; // 위도 1도 ≈ 111km
  const lngRange = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .gte('latitude', lat - latRange)
    .lte('latitude', lat + latRange)
    .gte('longitude', lng - lngRange)
    .lte('longitude', lng + lngRange)
    .order('rating', { ascending: false });

  if (error) throw error;
  return data as Restaurant[];
}