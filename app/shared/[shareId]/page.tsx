'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { getCourseByShareId } from '@/lib/supabase/courses';
import KakaoMap from '@/components/map/NaverMap';

export default function SharedCoursePage() {
  var params = useParams();
  var shareId = params.shareId as string;

  var [course, setCourse] = useState<any>(null);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState<string | null>(null);
  var [showMap, setShowMap] = useState(true);

  useEffect(function() {
    loadCourse();
  }, [shareId]);

  async function loadCourse() {
    try {
      var data = await getCourseByShareId(shareId);
      setCourse(data);
    } catch (err) {
      setError('코스를 찾을 수 없습니다');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{error || '코스를 찾을 수 없습니다'}</p>
      </div>
    );
  }

  var mapPlaces = course.places
    .filter(function(p: any) { return p.place_latitude && p.place_longitude; })
    .map(function(p: any) {
      return {
        id: p.id,
        name: p.place_name,
        type: p.place_type,
        latitude: p.place_latitude,
        longitude: p.place_longitude,
        address: p.place_address,
        rating: p.place_rating,
        category: p.place_category,
      };
    });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{course.title}</h1>
        {course.description && (
          <p className="text-gray-500">{course.description}</p>
        )}
        <p className="text-sm text-gray-400 mt-2">{course.places.length}개 장소</p>
      </div>

      {mapPlaces.length > 0 && showMap && (
        <div className="mb-6 relative" style={{ zIndex: 0 }}>
          <KakaoMap places={mapPlaces} className="h-48" />
        </div>
      )}

      <div className="relative" style={{ zIndex: 10 }}>
        <div className="space-y-2">
          {course.places.map(function(place: any, index: number) {
            return (
              <div key={place.id} className="bg-white rounded-xl p-3 shadow-sm border flex items-center gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={'text-xs px-2 py-0.5 rounded-full ' + (typeColors[place.place_type] || 'bg-gray-100 text-gray-600')}>
                      {typeLabels[place.place_type] || place.place_type}
                    </span>
                    <span className="font-medium text-sm truncate">{place.place_name}</span>
                  </div>
                  {place.place_address && (
                    <p className="text-xs text-gray-400 truncate">{place.place_address}</p>
                  )}
                </div>
                {place.place_rating && (
                  <span className="text-xs text-yellow-500">★ {place.place_rating.toFixed(1)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
