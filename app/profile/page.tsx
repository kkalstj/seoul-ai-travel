'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Heart, Star, LogOut, Edit2, Check, Camera, Lock, X } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getMyFavorites, getMyReviews } from '@/lib/supabase/interactions';
import ReviewModal from '@/components/reviews/ReviewModal';
import { signOut, getProfile, updateProfile, uploadAvatar, deleteAvatar, changePassword } from '@/lib/supabase/auth';

export default function ProfilePage() {
  var { t, locale } = useLanguage();
  var router = useRouter();
  var { user, loading: authLoading } = useAuth();
  var [profile, setProfile] = useState<any>(null);
  var [favorites, setFavorites] = useState<any[]>([]);
  var [reviews, setReviews] = useState<any[]>([]);
  var [loading, setLoading] = useState(true);
  var [editingNickname, setEditingNickname] = useState(false);
  var [nicknameInput, setNicknameInput] = useState('');
  var [activeTab, setActiveTab] = useState<'favorites' | 'reviews'>('favorites');
  var [reviewModal, setReviewModal] = useState<any>(null);
  var [uploadingAvatar, setUploadingAvatar] = useState(false);
  var fileInputRef = useRef<HTMLInputElement>(null);
  var [deleting, setDeleting] = useState(false);

  // 비밀번호 변경 관련 state
  var [showPasswordModal, setShowPasswordModal] = useState(false);
  var [currentPassword, setCurrentPassword] = useState('');
  var [newPassword, setNewPassword] = useState('');
  var [confirmPassword, setConfirmPassword] = useState('');
  var [passwordError, setPasswordError] = useState('');
  var [passwordSuccess, setPasswordSuccess] = useState(false);
  var [changingPassword, setChangingPassword] = useState(false);

  var labels: Record<string, Record<string, string>> = {
    changePhoto: { ko: '사진 변경', en: 'Change Photo', ja: '写真変更', zh: '更改照片' },
    changePassword: { ko: '비밀번호 변경', en: 'Change Password', ja: 'パスワード変更', zh: '修改密码' },
    currentPassword: { ko: '현재 비밀번호', en: 'Current Password', ja: '現在のパスワード', zh: '当前密码' },
    newPassword: { ko: '새 비밀번호', en: 'New Password', ja: '新しいパスワード', zh: '新密码' },
    confirmPassword: { ko: '비밀번호 확인', en: 'Confirm Password', ja: 'パスワード確認', zh: '确认密码' },
    passwordMismatch: { ko: '비밀번호가 일치하지 않습니다', en: 'Passwords do not match', ja: 'パスワードが一致しません', zh: '密码不匹配' },
    passwordTooShort: { ko: '비밀번호는 6자 이상이어야 합니다', en: 'Password must be at least 6 characters', ja: 'パスワードは6文字以上必要です', zh: '密码至少6个字符' },
    passwordChanged: { ko: '비밀번호가 변경되었습니다', en: 'Password changed successfully', ja: 'パスワードが変更されました', zh: '密码已更改' },
    passwordError: { ko: '비밀번호 변경 실패', en: 'Password change failed', ja: 'パスワード変更失敗', zh: '密码更改失败' },
    wrongPassword: { ko: '현재 비밀번호가 올바르지 않습니다', en: 'Current password is incorrect', ja: '現在のパスワードが正しくありません', zh: '当前密码不正确' },
    samePassword: { ko: '현재 비밀번호와 다른 비밀번호를 입력해주세요', en: 'New password must be different', ja: '現在と異なるパスワードを入力してください', zh: '新密码不能与当前密码相同' },
    save: { ko: '저장', en: 'Save', ja: '保存', zh: '保存' },
    cancel: { ko: '취소', en: 'Cancel', ja: 'キャンセル', zh: '取消' },
  };

  useEffect(function() {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }
    if (user) {
      loadData();
    }
  }, [user, authLoading]);

  async function handleDeleteAccount() {
  var confirmMsg = locale === 'ko' ? '정말 탈퇴하시겠습니까?\n\n모든 데이터(찜, 리뷰, 여행 코스)가 영구 삭제되며 복구할 수 없습니다.' :
    locale === 'ja' ? '本当に退会しますか？\n\nすべてのデータが永久に削除され、復元できません。' :
    locale === 'zh' ? '确定要注销账户吗？\n\n所有数据将被永久删除且无法恢复。' :
    'Are you sure you want to delete your account?\n\nAll data (favorites, reviews, trip courses) will be permanently deleted and cannot be recovered.';

  if (!confirm(confirmMsg)) return;

  var doubleConfirm = locale === 'ko' ? '마지막 확인입니다. 정말 탈퇴하시겠습니까?' :
    locale === 'ja' ? '最終確認です。本当に退会しますか？' :
    locale === 'zh' ? '最后确认。确定要注销吗？' :
    'Final confirmation. Delete your account?';

  if (!confirm(doubleConfirm)) return;

  setDeleting(true);
  try {
    var res = await fetch('/api/auth/delete-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });

    var data = await res.json();
    if (!res.ok) throw new Error(data.error);

    await signOut();
    router.push('/');
  } catch (err: any) {
    console.error('탈퇴 실패:', err);
    alert(locale === 'ko' ? '탈퇴에 실패했습니다. 다시 시도해주세요.' : 'Failed to delete account. Please try again.');
  } finally {
    setDeleting(false);
  }
}
  
  async function loadData() {
    try {
      var profileData = await getProfile(user.id);
      setProfile(profileData);
      setNicknameInput(profileData.nickname || '');

      var favData = await getMyFavorites();
      setFavorites(favData || []);

      var revData = await getMyReviews();
      setReviews(revData || []);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleNicknameSave() {
    if (!nicknameInput.trim() || !user) return;
    try {
      await updateProfile(user.id, { nickname: nicknameInput.trim() });
      setProfile({ ...profile, nickname: nicknameInput.trim() });
      setEditingNickname(false);
    } catch (err) {
      console.error('닉네임 수정 실패:', err);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    var file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(locale === 'ko' ? '2MB 이하의 이미지만 업로드 가능합니다' : 'Max file size is 2MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      var url = await uploadAvatar(user.id, file);
      setProfile({ ...profile, avatar_url: url });
    } catch (err) {
      console.error('아바타 업로드 실패:', err);
      alert(locale === 'ko' ? '이미지 업로드에 실패했습니다' : 'Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleAvatarDelete() {
  if (!user || !profile?.avatar_url) return;
  var msg = locale === 'ko' ? '프로필 사진을 삭제하시겠습니까?' :
    locale === 'ja' ? 'プロフィール写真を削除しますか？' :
    locale === 'zh' ? '确定删除头像吗？' :
    'Delete profile photo?';
  if (!confirm(msg)) return;

  try {
    await deleteAvatar(user.id);
    setProfile({ ...profile, avatar_url: null });
  } catch (err) {
    console.error('아바타 삭제 실패:', err);
  }
}
  
  async function handlePasswordChange() {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError(labels.currentPassword[locale]);
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(labels.passwordTooShort[locale]);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(labels.passwordMismatch[locale]);
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError(labels.samePassword[locale]);
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(function() {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.message || labels.passwordError[locale]);
    } finally {
      setChangingPassword(false);
    }
  }

  function closePasswordModal() {
    setShowPasswordModal(false);
    setPasswordError('');
    setPasswordSuccess(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  var typeLabels: Record<string, string> = {
    restaurant: '음식점',
    accommodation: '숙소',
    attraction: '관광지',
  };

  var typeColors: Record<string, string> = {
    restaurant: 'bg-orange-100 text-orange-700',
    accommodation: 'bg-purple-100 text-purple-700',
    attraction: 'bg-green-100 text-green-700',
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* 프로필 카드 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
        <div className="flex items-center gap-4">
          {/* 프로필 사진 */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <button
              onClick={function() { fileInputRef.current?.click(); }}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition"
            >
              {uploadingAvatar ? (
                <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera size={12} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            {profile?.avatar_url && (
              <button
                onClick={handleAvatarDelete}
                className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* 닉네임 + 이메일 */}
          <div className="flex-1">
            {editingNickname ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={function(e) { setNicknameInput(e.target.value); }}
                  onKeyDown={function(e) { if (e.key === 'Enter') handleNicknameSave(); }}
                  className="text-lg font-bold px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button onClick={handleNicknameSave} className="p-1 text-blue-600">
                  <Check size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{profile?.nickname || '사용자'}</h2>
                <button onClick={function() { setEditingNickname(true); }} className="p-1 text-gray-400 hover:text-gray-600">
                  <Edit2 size={14} />
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Heart size={14} className="text-red-400" /> {locale === 'ko' ? '찜' : '♥'} {favorites.length}</span>
              <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400" /> {locale === 'ko' ? '리뷰' : '★'} {reviews.length}</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 border rounded-lg hover:bg-gray-50"
          >
            <LogOut size={14} />
            {t('profile.logout')}
          </button>
        </div>

        {/* 비밀번호 변경 버튼 */}
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={function() { setShowPasswordModal(true); }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition"
          >
            <Lock size={14} />
            {labels.changePassword[locale]}
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="text-xs text-gray-400 hover:text-red-500 transition"
          >
            {deleting ? '...' : (locale === 'ko' ? '회원탈퇴' : locale === 'ja' ? '退会' : locale === 'zh' ? '注销账户' : 'Delete Account')}
          </button>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{labels.changePassword[locale]}</h3>
              <button onClick={closePasswordModal} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">{labels.currentPassword[locale]}</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={function(e) { setCurrentPassword(e.target.value); }}
                  placeholder="••••••"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">{labels.newPassword[locale]}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={function(e) { setNewPassword(e.target.value); }}
                  placeholder="••••••"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">{labels.confirmPassword[locale]}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={function(e) { setConfirmPassword(e.target.value); }}
                  onKeyDown={function(e) { if (e.key === 'Enter') handlePasswordChange(); }}
                  placeholder="••••••"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm text-green-500">{labels.passwordChanged[locale]}</p>
              )}

              <button
                onClick={handlePasswordChange}
                disabled={changingPassword}
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {changingPassword ? '...' : labels.save[locale]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={function() { setActiveTab('favorites'); }}
          className={'px-4 py-2 rounded-xl text-sm font-medium transition ' + (activeTab === 'favorites' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50')}
        >
          {t('profile.favorites')} ({favorites.length})
        </button>
        <button
          onClick={function() { setActiveTab('reviews'); }}
          className={'px-4 py-2 rounded-xl text-sm font-medium transition ' + (activeTab === 'reviews' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50')}
        >
          {t('profile.reviews')} ({reviews.length})
        </button>
      </div>

      {activeTab === 'favorites' && (
        <div className="space-y-2">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">{t('profile.noFavorites')}</p>
              <button onClick={function() { router.push('/explore'); }} className="text-blue-600 text-sm mt-2 hover:underline">
                {t('profile.browsePlaces')}
              </button>
            </div>
          ) : (
            favorites.map(function(fav) {
              return (
                <div
                  key={fav.id}
                  className="bg-white rounded-xl p-3 shadow-sm border flex items-center gap-3 cursor-pointer hover:shadow-md transition"
                  onClick={function() { router.push('/explore?tab=' + fav.place_type + '&search=' + encodeURIComponent(fav.place_name)); }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={'text-xs px-2 py-0.5 rounded-full ' + (typeColors[fav.place_type] || 'bg-gray-100 text-gray-600')}>
                        {typeLabels[fav.place_type] || fav.place_type}
                      </span>
                      <span className="font-medium text-sm truncate">{fav.place_name}</span>
                    </div>
                    {fav.place_address && (
                      <p className="text-xs text-gray-400 truncate">{fav.place_address}</p>
                    )}
                  </div>
                  {fav.place_rating > 0 && (
                    <span className="text-xs text-yellow-500">★ {fav.place_rating.toFixed(1)}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-2">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">{t('profile.noReviews')}</p>
              <button onClick={function() { router.push('/explore'); }} className="text-blue-600 text-sm mt-2 hover:underline">
                {t('profile.browsePlaces')}
              </button>
            </div>
          ) : (
            reviews.map(function(rev) {
              return (
                <div
                  key={rev.id}
                  className="bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition"
                  onClick={function() { router.push('/explore?tab=' + rev.place_type + '&search=' + encodeURIComponent(rev.place_name)); }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={'text-xs px-2 py-0.5 rounded-full ' + (typeColors[rev.place_type] || 'bg-gray-100 text-gray-600')}>
                      {typeLabels[rev.place_type] || rev.place_type}
                    </span>
                    <span className="font-medium text-sm">{rev.place_name}</span>
                    <span className="text-xs text-blue-500 ml-auto">{t('profile.viewReview')} </span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(function(star) {
                      return (
                        <Star
                          key={star}
                          size={14}
                          className={star <= rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                        />
                      );
                    })}
                  </div>
                  {rev.content && (
                    <p className="text-sm text-gray-600 mt-1">{rev.content}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {reviewModal && (
        <ReviewModal
          placeId={reviewModal.id}
          placeType={reviewModal.type}
          placeName={reviewModal.name}
          onClose={function() { setReviewModal(null); }}
          onReviewAdded={function() { loadData(); }}
        />
      )}
    </div>
  );
}
