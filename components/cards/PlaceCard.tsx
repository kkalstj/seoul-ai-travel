'use client';

import { Star, MapPin, UtensilsCrossed, Hotel, Landmark } from 'lucide-react';

interface PlaceCardProps {
  name: string;
  type: 'restaurant' | 'accommodation' | 'attraction';
  address?: string | null;
  rating?: number | null;
  category?: string | null;
  description?: string | null;
  reviewCount?: number | null;
  onClick?: () => void;
}

const typeConfig = {
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
  name,
  type,
  address,
  rating,
  category,
  description,
  reviewCount,
  onClick,
}: PlaceCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`p-4 bg-white rounded-xl border ${config.border} hover:shadow-md transition-all cursor-pointer group`}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className={`p-2 ${config.bg} rounded-lg shrink-0`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {name}
          </h3>

          {/* 카테고리 뱃지 */}
          {category && (
            <span className={`inline-block mt-1 px-2 py-0.5 ${config.bg} ${config.color} text-xs font-medium rounded-full`}>
              {category}
            </span>
          )}

          {/* 주소 */}
          {address && (
            <div className="flex items-center gap-1 mt-1.5 text-gray-500 text-sm">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{address}</span>
            </div>
          )}

          {/* 설명 */}
          {description && (
            <p className="mt-1.5 text-gray-500 text-sm line-clamp-2">{description}</p>
          )}

          {/* 평점 */}
          {rating && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
              {reviewCount && (
                <span className="text-sm text-gray-400">({reviewCount.toLocaleString()})</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}