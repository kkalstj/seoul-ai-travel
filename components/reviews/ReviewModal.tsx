'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useEffect, useState } from 'react';
import { X, Star, Send, Trash2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getPlaceReviews, addReview, deleteReview } from '@/lib/supabase/interactions';

interface ReviewModalProps {
  placeId: string;
  placeType: string;
  placeName: string;
  onClose: () => void;
  onReviewAdded?: () => void;
}

export default function ReviewModal({ placeId, placeType, placeName, onClose, onReviewAdded }: ReviewModalProps) {
  var { t } = useLanguage();
  var { user } = useAuth();
  var [reviews, setReviews] = useState<any[]>([]);
  var [loading, setLoading] = useState(true);
  var [rating, setRating] = useState(0);
  var [hoverRating, setHoverRating] = useState(0);
  var [content, setContent] = useState('');
  var [submitting, setSubmitting] = useState(false);

  useEffect(function() {
    loadReviews();
  }, [placeId, placeType]);

  async function loadReviews() {
    try {
      var data = await getPlaceReviews(placeId, placeType);
      setReviews(data || []);
    } catch (err) {
      console.error('리뷰 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!user) {
      alert(t('favorite.loginRequired'));
      return;
    }
    if (rating === 0) {
      alert(t('review.selectRating'));
      return;
    }
    if (submitting) return;
    setSubmitting(true);

    try {
      await addReview({
        place_id: placeId,
        place_type: placeType,
        place_name: placeName,
        rating: rating,
        content: content.trim() || undefined,
      });
      setRating(0);
      setContent('');
      await loadReviews();
      if (onReviewAdded) onReviewAdded();
    } catch (err: any) {
      console.error('리뷰 작성 실패:', err);
      alert('리뷰 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(reviewId: string) {
    if (!confirm(t('review.deleteConfirm'))) return;
    try {
      await deleteReview(reviewId);
      await loadReviews();
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      console.error('리뷰 삭제 실패:', err);
      alert('리뷰 삭제에 실패했습니다.');
    }
  }

  function formatDate(dateStr: string) {
    var date = new Date(dateStr);
    return date.getFullYear() + '.' + String(date.getMonth() + 1).padStart(2, '0') + '.' + String(date.getDate()).padStart(2, '0');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
        onClick={function(e) { e.stopPropagation(); }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-bold text-gray-900">{placeName}</h3>
            <p className="text-sm text-gray-500">리뷰 {reviews.length}개</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {user && (
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(function(star) {
                return (
                  <button
                    key={star}
                    onClick={function() { setRating(star); }}
                    onMouseEnter={function() { setHoverRating(star); }}
                    onMouseLeave={function() { setHoverRating(0); }}
                    className="p-0.5"
                  >
                    <Star
                      size={24}
                      className={star <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                  </button>
                );
              })}
              {rating > 0 && <span className="text-sm text-gray-500 ml-1">{rating}{t('review.point')}</span>}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={content}
                onChange={function(e) { setContent(e.target.value); }}
                onKeyDown={function(e) { if (e.key === 'Enter') handleSubmit(); }}
                placeholder="{t('review.write')}"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {!user && (
          <div className="p-4 border-b bg-gray-50 text-center text-sm text-gray-500">
            리뷰를 작성하려면 <a href="/auth" className="text-blue-600 hover:underline">로그인</a>해주세요
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Star size={32} className="mx-auto mb-2 text-gray-300" />
              <p>{t('review.noReviews')}</p>
              <p className="text-sm">{t('review.firstReview')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(function(review) {
                var isMyReview = user && user.id === review.user_id;
                return (
                  <div key={review.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {review.profiles?.nickname || '{t('review.anonymous')}'}
                        </span>
                        {isMyReview && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">{t('review.myReview')}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                        {isMyReview && (
                          <button
                            onClick={function() { handleDelete(review.id); }}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                            title="삭제"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 mb-1">
                      {[1, 2, 3, 4, 5].map(function(star) {
                        return (
                          <Star
                            key={star}
                            size={12}
                            className={star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                          />
                        );
                      })}
                    </div>
                    {review.content && (
                      <p className="text-sm text-gray-600">{review.content}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
