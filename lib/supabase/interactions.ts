import { supabase } from './client';

// ===== 찜하기 =====

// 찜 추가
export async function addFavorite(place: {
  place_id: string;
  place_type: string;
  place_name: string;
  place_address?: string;
  place_latitude?: number;
  place_longitude?: number;
  place_rating?: number;
  place_category?: string;
}) {
  var { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  var { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, ...place })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// 찜 삭제
export async function removeFavorite(placeId: string, placeType: string) {
  var { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  var { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('place_id', placeId)
    .eq('place_type', placeType);
  if (error) throw error;
}

// 찜 여부 확인
export async function isFavorite(placeId: string, placeType: string) {
  var { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  var { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('place_id', placeId)
    .eq('place_type', placeType)
    .single();
  return !!data;
}

// 내 찜 목록
export async function getMyFavorites() {
  var { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  var { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ===== 리뷰 =====

// 리뷰 작성
export async function addReview(review: {
  place_id: string;
  place_type: string;
  place_name: string;
  rating: number;
  content?: string;
}) {
  var { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  var { data, error } = await supabase
    .from('reviews')
    .insert({ user_id: user.id, ...review })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// 리뷰 수정
export async function updateReview(reviewId: string, updates: { rating?: number; content?: string }) {
  var { data, error } = await supabase
    .from('reviews')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', reviewId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// 리뷰 삭제
export async function deleteReview(reviewId: string) {
  var { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);
  if (error) throw error;
}

// 장소의 리뷰 목록
export async function getPlaceReviews(placeId: string, placeType: string) {
  var { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(nickname)')
    .eq('place_id', placeId)
    .eq('place_type', placeType)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// 내 리뷰 목록
export async function getMyReviews() {
  var { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  var { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
