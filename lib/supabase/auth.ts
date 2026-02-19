import { supabase } from './client';

// 회원가입
export async function signUp(email: string, password: string) {
  var { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// 로그인
export async function signIn(email: string, password: string) {
  var { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// 로그아웃
export async function signOut() {
  var { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// 현재 사용자 가져오기
export async function getCurrentUser() {
  var { data: { user } } = await supabase.auth.getUser();
  return user;
}

// 세션 변경 리스너
export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange(function(event, session) {
    callback(session?.user || null);
  });
}

// 프로필 조회
export async function getProfile(userId: string) {
  var { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

// 프로필 수정
export async function updateProfile(userId: string, updates: { nickname?: string; avatar_url?: string }) {
  var { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
