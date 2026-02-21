'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Heart, Star, LogOut, Edit2, Check } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { signOut, getProfile, updateProfile } from '@/lib/supabase/auth';
import { getMyFavorites } from '@/lib/supabase/interactions';
import { getMyReviews } from '@/lib/supabase/interactions';
import ReviewModal from '@/components/reviews/ReviewModal';

export default function ProfilePage() {
  var { t } = useLanguage();
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

  useEffect(function() {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }
    if (user) {
      loadData();
    }
  }, [user, authLoading]);

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
      <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
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
              <span className="flex items-center gap-1"><Heart size={14} className="text-red-400" /> 찜 {favorites.length}</span>
              <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400" /> 리뷰 {reviews.length}</span>
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
      </div>

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
                <div key={fav.id} className="bg-white rounded-xl p-3 shadow-sm border flex items-center gap-3">
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
                  onClick={function() { setReviewModal({ id: rev.place_id, type: rev.place_type, name: rev.place_name }); }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={'text-xs px-2 py-0.5 rounded-full ' + (typeColors[rev.place_type] || 'bg-gray-100 text-gray-600')}>
                      {typeLabels[rev.place_type] || rev.place_type}
                    </span>
                    <span className="font-medium text-sm">{rev.place_name}</span>
                    <span className="text-xs text-blue-500 ml-auto">{t('profile.viewReview')} →</span>
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
