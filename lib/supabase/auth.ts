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

// 아바타 이미지 업로드
export async function uploadAvatar(userId: string, file: File) {
  var fileExt = file.name.split('.').pop();
  var fileName = userId + '-' + Date.now() + '.' + fileExt;
  var filePath = 'avatars/' + fileName;

  var { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  var { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  await updateProfile(userId, { avatar_url: data.publicUrl });

  return data.publicUrl;
}

// 비밀번호 재설정 이메일 발송
export async function resetPassword(email: string) {
  var { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/auth/reset-password',
  });
  if (error) throw error;
}

// 비밀번호 변경
export async function updatePassword(newPassword: string) {
  var { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
}
