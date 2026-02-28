'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, GripVertical, MapPin, Share2, Search } from 'lucide-react';
import { getCourseDetail, removePlaceFromCourse, reorderPlaces, addPlaceToCourse, updateCourse } from '@/lib/supabase/courses';
import { supabase } from '@/lib/supabase/client';
import GoogleMap from '@/components/map/GoogleMap';

interface CoursePlace {
  id: string;
  place_type: string;
  place_name: string;
  place_address: string | null;
  place_latitude: number | null;
  place_longitude: number | null;
  place_rating: number | null;
  place_category: string | null;
  day_number: number;
  order_index: number;
  memo: string | null;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  share_id: string;
  places: CoursePlace[];
}

export default function CourseDetailPage() {
  var { t } = useLanguage();
  var params = useParams();
  var router = useRouter();
  var courseId = params.id as string;

  var [course, setCourse] = useState<Course | null>(null);
  var [loading, setLoading] = useState(true);
  var [showSearch, setShowSearch] = useState(false);
  var [searchQuery, setSearchQuery] = useState('');
  var [searchResults, setSearchResults] = useState<any[]>([]);
  var [searching, setSearching] = useState(false);
  var [editingTitle, setEditingTitle] = useState(false);
  var [titleInput, setTitleInput] = useState('');
  var [copied, setCopied] = useState(false);
  var [showMap, setShowMap] = useState(false);
  var [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(function() {
    loadCourse();
  }, [courseId]);

  async function loadCourse() {
    try {
      var data = await getCourseDetail(courseId);
      setCourse(data);
      setTitleInput(data.title);
    } catch (err) {
      console.error('코스 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      var results: any[] = [];

      var { data: restaurants } = await supabase
        .from('restaurants')
        .select('id, name, address, latitude, longitude, rating, food_type')
        .ilike('name', '%' + searchQuery + '%')
        .limit(5);

      if (restaurants) {
        restaurants.forEach(function(r: any) {
          results.push({ ...r, type: 'restaurant', category: r.food_type });
        });
      }

      var { data: accommodations } = await supabase
        .from('accommodations')
        .select('id, name, address, latitude, longitude, rating, accommodation_type')
        .ilike('name', '%' + searchQuery + '%')
        .limit(5);

      if (accommodations) {
        accommodations.forEach(function(a: any) {
          results.push({ ...a, type: 'accommodation', category: a.accommodation_type });
        });
      }

      var { data: attractions } = await supabase
        .from('attractions')
        .select('id, name, address, latitude, longitude, category')
        .ilike('name', '%' + searchQuery + '%')
        .limit(5);

      if (attractions) {
        attractions.forEach(function(a: any) {
          results.push({ ...a, type: 'attraction', rating: null });
        });
      }

      setSearchResults(results);
    } catch (err) {
      console.error('검색 실패:', err);
    } finally {
      setSearching(false);
    }
  }

  async function handleAddPlace(result: any) {
    if (!course) return;
    try {
      await addPlaceToCourse(course.id, {
        place_id: result.id,
        place_type: result.type,
        place_name: result.name,
        place_address: result.address,
        place_latitude: result.latitude,
        place_longitude: result.longitude,
        place_rating: result.rating,
        place_category: result.category,
      });
      await loadCourse();
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error('장소 추가 실패:', err);
    }
  }

  async function handleRemovePlace(placeId: string) {
    try {
      await removePlaceFromCourse(placeId);
      await loadCourse();
    } catch (err) {
      console.error('장소 삭제 실패:', err);
    }
  }

  async function handleTitleSave() {
    if (!course || !titleInput.trim()) return;
    try {
      await updateCourse(course.id, titleInput.trim());
      setCourse({ ...course, title: titleInput.trim() });
      setEditingTitle(false);
    } catch (err) {
      console.error('제목 수정 실패:', err);
    }
  }

  function handleShare() {
    if (!course) return;
    var url = window.location.origin + '/shared/' + course.share_id;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(function() { setCopied(false); }, 2000);
  }

  async function handleMoveUp(index: number) {
    if (!course || index === 0) return;
    var newPlaces = [...course.places];
    var temp = newPlaces[index];
    newPlaces[index] = newPlaces[index - 1];
    newPlaces[index - 1] = temp;
    var placeIds = newPlaces.map(function(p) { return p.id; });
    await reorderPlaces(course.id, placeIds);
    await loadCourse();
  }

  async function handleMoveDown(index: number) {
    if (!course || index === course.places.length - 1) return;
    var newPlaces = [...course.places];
    var temp = newPlaces[index];
    newPlaces[index] = newPlaces[index + 1];
    newPlaces[index + 1] = temp;
    var placeIds = newPlaces.map(function(p) { return p.id; });
    await reorderPlaces(course.id, placeIds);
    await loadCourse();
  }

  var mapPlaces = course ? course.places
    .filter(function(p) { return p.place_latitude && p.place_longitude; })
    .map(function(p) {
      return {
        id: p.id,
        name: p.place_name,
        type: p.place_type as any,
        latitude: p.place_latitude!,
        longitude: p.place_longitude!,
        address: p.place_address,
        rating: p.place_rating,
        category: p.place_category,
      };
    }) : [];

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

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{t('shared.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={function() { router.push('/my-trip'); }} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          {editingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={function(e) { setTitleInput(e.target.value); }}
              onBlur={handleTitleSave}
              onKeyDown={function(e) { if (e.key === 'Enter') handleTitleSave(); }}
              className="text-xl font-bold w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <h1
              className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={function() { setEditingTitle(true); }}
            >
              {course.title}
            </h1>
          )}
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition"
        >
          <Share2 size={14} />
          {copied ? t('myTrip.copied') : t('myTrip.share')}
        </button>
      </div>

      {/* 지도 토글 */}
      {mapPlaces.length > 0 && (
        <div className="mb-4">
          <button
            onClick={function() { setShowMap(!showMap); }}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <MapPin size={16} />
            {showMap ? t('myTrip.hideMap') : t('myTrip.showMap') + ' (' + mapPlaces.length + ')'}
          </button>
          {showMap && (
            <div className="mt-3">
              <GoogleMap places={mapPlaces} className="h-80" />
            </div>
          )}
        </div>
      )}

      {/* 장소 추가 */}
      <div className="mb-4">
        <button
          onClick={function() { setShowSearch(!showSearch); }}
          className="flex items-center gap-2 w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-3 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition"
        >
          <Plus size={18} />
          {t('myTrip.addPlace')}
        </button>

        {showSearch && (
          <div className="mt-3 bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={function(e) { setSearchQuery(e.target.value); }}
                onKeyDown={function(e) { if (e.key === 'Enter') handleSearch(); }}
                placeholder={t('myTrip.searchPlace')}
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Search size={16} />
              </button>
            </div>

            {searching && (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map(function(result) {
                  return (
                    <div
                      key={result.type + '-' + result.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={function() { handleAddPlace(result); }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={'text-xs px-2 py-0.5 rounded-full ' + (typeColors[result.type] || 'bg-gray-100 text-gray-600')}>
                            {typeLabels[result.type] || result.type}
                          </span>
                          <span className="font-medium text-sm">{result.name}</span>
                        </div>
                        {result.address && (
                          <p className="text-xs text-gray-400 mt-0.5 ml-1">{result.address}</p>
                        )}
                      </div>
                      <Plus size={16} className="text-blue-500" />
                    </div>
                  );
                })}
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !searching && (
              <p className="text-center text-sm text-gray-400 py-3">{t('explore.noResults')}</p>
            )}
          </div>
        )}
      </div>

      {/* 장소 목록 */}
      {course.places.length === 0 ? (
        <div className="text-center py-12">
          <MapPin size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">{t('myTrip.noPlaces')}</p>
          <p className="text-gray-400 text-sm">{t('myTrip.noPlacesHint')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {course.places.map(function(place, index) {
            return (
              <div key={place.id} className="bg-white rounded-xl p-3 shadow-sm border flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={function() { handleMoveUp(index); }}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                  >
                    ▲
                  </button>
                  <span className="text-xs text-gray-300 text-center">{index + 1}</span>
                  <button
                    onClick={function() { handleMoveDown(index); }}
                    disabled={index === course.places.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                  >
                    ▼
                  </button>
                </div>
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
                <button
                  onClick={function() { handleRemovePlace(place.id); }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
