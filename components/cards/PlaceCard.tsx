'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useState, useEffect } from 'react';
import { Star, MapPin, UtensilsCrossed, Hotel, Landmark, Heart } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { addFavorite, removeFavorite, isFavorite } from '@/lib/supabase/interactions';

interface PlaceCardProps {
  id: string;
  name: string;
  type: 'restaurant' | 'accommodation' | 'attraction';
  address?: string | null;
  rating?: number | null;
  category?: string | null;
  description?: string | null;
  reviewCount?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  onClick?: () => void;
  onReviewClick?: () => void;
}

var typeConfig = {
  restaurant: {
    icon: UtensilsCrossed,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
  accommodation: {
    icon: Hotel,
    color: 'text-teal-500',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
  attraction: {
    icon: Landmark,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
};

export default function PlaceCard({
  id,
  name,
  type,
  address,
  rating,
  category,
  description,
  reviewCount,
  latitude,
  longitude,
  onClick,
  onReviewClick,
}: PlaceCardProps) {
  var { t } = useLanguage();
  var config = typeConfig[type];
  var Icon = config.icon;
  var { user } = useAuth();
  var [favorited, setFavorited] = useState(false);
  var [favLoading, setFavLoading] = useState(false);

  useEffect(function() {
    if (user && id) {
      isFavorite(id, type).then(function(result) {
        setFavorited(result);
      });
    }
  }, [user, id, type]);

  async function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) {
      alert(t('favorite.loginRequired'));
      return;
    }
    if (favLoading) return;
    setFavLoading(true);

    try {
      if (favorited) {
        await removeFavorite(id, type);
        setFavorited(false);
      } else {
        await addFavorite({
          place_id: id,
          place_type: type,
          place_name: name,
          place_address: address || undefined,
          place_latitude: latitude || undefined,
          place_longitude: longitude || undefined,
          place_rating: rating || undefined,
          place_category: category || undefined,
        });
        setFavorited(true);
      }
    } catch (err) {
      console.error('찜하기 실패:', err);
    } finally {
      setFavLoading(false);
    }
  }

  function handleReview(e: React.MouseEvent) {
    e.stopPropagation();
    if (onReviewClick) onReviewClick();
  }

  return (
    <div
      onClick={onClick}
      className={'p-4 bg-white rounded-xl border ' + config.border + ' hover:shadow-md transition-all cursor-pointer group'}
    >
      <div className="flex items-start gap-3">
        <div className={'p-2 ' + config.bg + ' rounded-lg shrink-0'}>
          <Icon className={'w-5 h-5 ' + config.color} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {name}
            </h3>
            <button
              onClick={handleFavorite}
              className={'p-1.5 rounded-lg transition-colors shrink-0 ml-2 ' + (favorited ? 'text-red-500' : 'text-gray-300 hover:text-red-400')}
            >
              <Heart size={18} className={favorited ? 'fill-red-500' : ''} />
            </button>
          </div>

          {category && (
            <span className={'inline-block mt-1 px-2 py-0.5 ' + config.bg + ' ' + config.color + ' text-xs font-medium rounded-full'}>
              {category}
            </span>
          )}

          {address && (
            <div className="flex items-center gap-1 mt-1.5 text-gray-500 text-sm">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{address}</span>
            </div>
          )}

          {description && (
            <p className="mt-1.5 text-gray-500 text-sm line-clamp-2">{description}</p>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              {rating > 0 && (
                <>
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
                  {reviewCount > 0 && (
                    <span className="text-sm text-gray-400">({reviewCount.toLocaleString()})</span>
                  )}
                </>
              )}
            </div>
            <button
              onClick={handleReview}
              className="text-xs text-blue-600 hover:underline"
            >
              {t('explore.reviewView')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


