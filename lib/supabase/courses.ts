import { supabase } from './client';

// 디바이스 ID 생성/조회 (브라우저별 고유 ID)
export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

// 코스 목록 조회 (내 코스)
export async function getMyCourses() {
  const deviceId = getDeviceId();
  const { data, error } = await supabase
    .from('travel_courses')
    .select('*')
    .eq('device_id', deviceId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}

// 코스 상세 조회 (장소 포함)
export async function getCourseDetail(courseId: string) {
  const { data: course, error: courseError } = await supabase
    .from('travel_courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (courseError) throw courseError;

  const { data: places, error: placesError } = await supabase
    .from('course_places')
    .select('*')
    .eq('course_id', courseId)
    .order('day_number', { ascending: true })
    .order('order_index', { ascending: true });

  if (placesError) throw placesError;

  return { ...course, places: places || [] };
}

// 공유 ID로 코스 조회
export async function getCourseByShareId(shareId: string) {
  const { data: course, error: courseError } = await supabase
    .from('travel_courses')
    .select('*')
    .eq('share_id', shareId)
    .single();

  if (courseError) throw courseError;

  const { data: places, error: placesError } = await supabase
    .from('course_places')
    .select('*')
    .eq('course_id', course.id)
    .order('day_number', { ascending: true })
    .order('order_index', { ascending: true });

  if (placesError) throw placesError;

  return { ...course, places: places || [] };
}

// 새 코스 생성
export async function createCourse(title: string, description?: string) {
  const deviceId = getDeviceId();
  const { data, error } = await supabase
    .from('travel_courses')
    .insert({ title, description, device_id: deviceId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 코스에 장소 추가
export async function addPlaceToCourse(
  courseId: string,
  place: {
    place_id?: string;
    place_type: string;
    place_name: string;
    place_address?: string;
    place_latitude?: number;
    place_longitude?: number;
    place_rating?: number;
    place_category?: string;
    day_number?: number;
    memo?: string;
  }
) {
  // 현재 최대 order_index 조회
  const { data: existing } = await supabase
    .from('course_places')
    .select('order_index')
    .eq('course_id', courseId)
    .order('order_index', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].order_index + 1 : 0;

  const { data, error } = await supabase
    .from('course_places')
    .insert({
      course_id: courseId,
      order_index: nextOrder,
      day_number: place.day_number || 1,
      ...place,
    })
    .select()
    .single();

  if (error) throw error;

  // total_places 업데이트
  await supabase
    .from('travel_courses')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', courseId);

  return data;
}

// 코스에서 장소 삭제
export async function removePlaceFromCourse(placeId: string) {
  const { error } = await supabase
    .from('course_places')
    .delete()
    .eq('id', placeId);

  if (error) throw error;
}

// 장소 순서 변경
export async function reorderPlaces(courseId: string, placeIds: string[]) {
  const updates = placeIds.map((id, index) => ({
    id,
    order_index: index,
  }));

  for (const update of updates) {
    await supabase
      .from('course_places')
      .update({ order_index: update.order_index })
      .eq('id', update.id);
  }
}

// 코스 삭제
export async function deleteCourse(courseId: string) {
  const { error } = await supabase
    .from('travel_courses')
    .delete()
    .eq('id', courseId);

  if (error) throw error;
}

// 코스 제목/설명 수정
export async function updateCourse(courseId: string, title: string, description?: string) {
  const { data, error } = await supabase
    .from('travel_courses')
    .update({ title, description, updated_at: new Date().toISOString() })
    .eq('id', courseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// AI 추천 코스를 저장
export async function saveAICourse(
  title: string,
  places: Array<{
    place_type: string;
    place_name: string;
    place_address?: string;
    place_latitude?: number;
    place_longitude?: number;
    place_rating?: number;
    place_category?: string;
    day_number?: number;
    memo?: string;
  }>
) {
  const course = await createCourse(title, 'AI 추천 코스');

  for (let i = 0; i < places.length; i++) {
    await addPlaceToCourse(course.id, {
      ...places[i],
      day_number: places[i].day_number || 1,
    });
  }

  return course;
}
