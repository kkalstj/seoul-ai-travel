'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, MapPin, Share2, Search, Calendar, ChevronDown, ChevronUp, Map } from 'lucide-react';
import { getCourseDetail, removePlaceFromCourse, addPlaceToCourse, updateCourse } from '@/lib/supabase/courses';
import { supabase } from '@/lib/supabase/client';

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

function loadGoogleMaps(): Promise<void> {
  return new Promise(function(resolve, reject) {
    if ((window as any).google && (window as any).google.maps) {
      resolve();
      return;
    }
    var existing = document.getElementById('google-maps-script');
    if (existing) {
      existing.addEventListener('load', function() { resolve(); });
      return;
    }
    var script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY + '&libraries=places';
    script.async = true;
    script.defer = true;
    script.onload = function() { resolve(); };
    script.onerror = function() { reject(new Error('Google Maps load failed')); };
    document.head.appendChild(script);
  });
}

export default function CourseDetailPage() {
  var { t, locale } = useLanguage();
  var params = useParams();
  var router = useRouter();
  var courseId = params.id as string;

  var [course, setCourse] = useState<Course | null>(null);
  var [loading, setLoading] = useState(true);
  var [editingTitle, setEditingTitle] = useState(false);
  var [titleInput, setTitleInput] = useState('');
  var [copied, setCopied] = useState(false);
  var [showMap, setShowMap] = useState(false);
  var [searchDay, setSearchDay] = useState<number | null>(null);
  var [searchQuery, setSearchQuery] = useState('');
  var [searchResults, setSearchResults] = useState<any[]>([]);
  var [searching, setSearching] = useState(false);
  var [collapsedDays, setCollapsedDays] = useState<Record<number, boolean>>({});
  var [maxDay, setMaxDay] = useState<number>(1);
  var mapContainerRef = useRef<HTMLDivElement>(null);
  var mapInstanceRef2 = useRef<any>(null);
  var mapRenderersRef = useRef<any[]>([]);
  var mapMarkersRef = useRef<any[]>([]);
  var [transitInfo, setTransitInfo] = useState<any[]>([]);

  useEffect(function() {
    loadCourse();
  }, [courseId]);

  useEffect(function() {
    if (!showMap || !course) return;

    var timer = setTimeout(function() {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef2.current) {
        drawRoute(mapInstanceRef2.current, course);
        return;
      }

      async function initMap() {
        try {
          await loadGoogleMaps();
          if (!mapContainerRef.current) return;
          var google = (window as any).google;

          var map = new google.maps.Map(mapContainerRef.current, {
            center: { lat: 37.5665, lng: 126.978 },
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          mapInstanceRef2.current = map;
          drawRoute(map, course);
        } catch (err) {
          console.error('Map error:', err);
        }
      }

      initMap();
    }, 100);

    return function() { clearTimeout(timer); };
  }, [showMap, course]);

  function drawRoute(map: any, courseData: Course) {
    var google = (window as any).google;
    if (!google) return;

    mapMarkersRef.current.forEach(function(m) { m.setMap(null); });
    mapMarkersRef.current = [];

    mapRenderersRef.current.forEach(function(r) { r.setMap(null); });
    mapRenderersRef.current = [];

    var places = courseData.places.filter(function(p) { return p.place_latitude && p.place_longitude; });
    if (places.length === 0) return;

    var bounds = new google.maps.LatLngBounds();
    var typeColors: Record<string, string> = {
      restaurant: '#F97316',
      accommodation: '#14B8A6',
      attraction: '#8B5CF6',
    };

    places.forEach(function(place, i) {
      var pos = { lat: Number(place.place_latitude), lng: Number(place.place_longitude) };
      var color = typeColors[place.place_type] || '#8B5CF6';

      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        label: { text: String(i + 1), color: 'white', fontWeight: 'bold', fontSize: '11px' },
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 14, fillColor: color, fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 },
        title: place.place_name,
      });

      var infoWindow = new google.maps.InfoWindow({
        content: '<div style="font-size:13px;font-weight:bold;padding:4px;">' + (i + 1) + '. ' + place.place_name + '</div>',
      });

      (function(m, iw) {
        m.addListener('click', function() { iw.open(map, m); });
      })(marker, infoWindow);

      mapMarkersRef.current.push(marker);
      bounds.extend(pos);
    });

    if (places.length > 1) {
      var directionsService = new google.maps.DirectionsService();
      var totalSegments = places.length - 1;
      var infoResults: any[] = new Array(totalSegments).fill(null);
      var completed = 0;

      for (var i = 0; i < places.length - 1; i++) {
        (function(origin, destination, index) {
          var renderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true,
            polylineOptions: { strokeColor: '#4285F4', strokeWeight: 4, strokeOpacity: 0.7 },
          });
          mapRenderersRef.current.push(renderer);

          directionsService.route(
            {
              origin: new google.maps.LatLng(Number(origin.place_latitude), Number(origin.place_longitude)),
              destination: new google.maps.LatLng(Number(destination.place_latitude), Number(destination.place_longitude)),
              travelMode: google.maps.TravelMode.TRANSIT,
              region: 'kr',
            },
            function(result: any, status: any) {
              if (status === 'OK') {
                renderer.setDirections(result);

                var leg = result.routes[0].legs[0];
                var steps = leg.steps || [];
                var transitSteps: any[] = [];

                steps.forEach(function(step: any) {
                  if (step.travel_mode === 'TRANSIT') {
                    var line = step.transit.line;
                    transitSteps.push({
                      vehicle: line.vehicle.type,
                      name: line.short_name || line.name,
                      color: line.color || '#4285F4',
                      textColor: line.text_color || '#FFFFFF',
                      numStops: step.transit.num_stops,
                      departure: step.transit.departure_stop.name,
                      arrival: step.transit.arrival_stop.name,
                    });
                  }
                });

                infoResults[index] = {
                  from: origin.place_name,
                  to: destination.place_name,
                  duration: leg.duration.text,
                  distance: leg.distance.text,
                  steps: transitSteps,
                };
              } else {
                infoResults[index] = {
                  from: origin.place_name,
                  to: destination.place_name,
                  duration: null,
                  distance: null,
                  steps: [],
                };
              }

              completed++;
              if (completed === totalSegments) {
                setTransitInfo(infoResults);
              }
            }
          );
        })(places[i], places[i + 1], i);
      }

      map.fitBounds(bounds, { padding: 50 });
    } else {
      map.setCenter({ lat: Number(places[0].place_latitude), lng: Number(places[0].place_longitude) });
      map.setZoom(15);
    }
  }

 async function loadCourse() {
    try {
      var data = await getCourseDetail(courseId);
      setCourse(data);
      setTitleInput(data.title);
      var highest = 1;
      data.places.forEach(function(p: any) {
        if (p.day_number > highest) highest = p.day_number;
      });
      setMaxDay(function(prev) { return Math.max(prev, highest); });
    } catch (err) {
      console.error('코스 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }

 function getDays(): number[] {
    var days: number[] = [];
    for (var i = 1; i <= maxDay; i++) {
      days.push(i);
    }
    return days;
  }

  function getPlacesForDay(day: number): CoursePlace[] {
    if (!course) return [];
    return course.places
      .filter(function(p) { return p.day_number === day; })
      .sort(function(a, b) { return a.order_index - b.order_index; });
  }

  function handleAddDay() {
    var newDay = maxDay + 1;
    setMaxDay(newDay);
    setCollapsedDays(function(prev) { var next = { ...prev }; next[newDay] = false; return next; });
  }

  async function handleRemoveDay(day: number) {
    if (!course) return;
    var dayPlaces = getPlacesForDay(day);
    var confirmMsg = locale === 'ko' ? 'Day ' + day + '의 장소 ' + dayPlaces.length + '개가 모두 삭제됩니다. 삭제하시겠습니까?' :
      locale === 'ja' ? 'Day ' + day + 'の' + dayPlaces.length + '箇所がすべて削除されます。削除しますか？' :
      locale === 'zh' ? '将删除Day ' + day + '的' + dayPlaces.length + '个地点。确定删除吗？' :
      'All ' + dayPlaces.length + ' places in Day ' + day + ' will be deleted. Continue?';
    
    if (dayPlaces.length > 0 && !confirm(confirmMsg)) return;

    for (var i = 0; i < dayPlaces.length; i++) {
      await removePlaceFromCourse(dayPlaces[i].id);
    }

    var allPlaces = course.places.filter(function(p) { return p.day_number !== day; });
    for (var j = 0; j < allPlaces.length; j++) {
      var oldDay = allPlaces[j].day_number;
      var newDay = oldDay > day ? oldDay - 1 : oldDay;
      if (oldDay !== newDay) {
        await supabase.from('course_places').update({ day_number: newDay }).eq('id', allPlaces[j].id);
      }
    }

    setMaxDay(function(prev) { return Math.max(1, prev - 1); });
    await loadCourse();
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

  async function handleAddPlace(result: any, dayNumber: number) {
    if (!course) return;
    try {
      await addPlaceToCourse(course.id, {
        place_type: result.type,
        place_name: result.name,
        place_address: result.address,
        place_latitude: result.latitude,
        place_longitude: result.longitude,
        place_rating: result.rating,
        place_category: result.category,
        day_number: dayNumber,
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

  async function handleMoveUp(place: CoursePlace, dayPlaces: CoursePlace[], index: number) {
    if (index === 0) return;
    var prevPlace = dayPlaces[index - 1];
    await supabase.from('course_places').update({ order_index: prevPlace.order_index }).eq('id', place.id);
    await supabase.from('course_places').update({ order_index: place.order_index }).eq('id', prevPlace.id);
    await loadCourse();
  }

  async function handleMoveDown(place: CoursePlace, dayPlaces: CoursePlace[], index: number) {
    if (index === dayPlaces.length - 1) return;
    var nextPlace = dayPlaces[index + 1];
    await supabase.from('course_places').update({ order_index: nextPlace.order_index }).eq('id', place.id);
    await supabase.from('course_places').update({ order_index: place.order_index }).eq('id', nextPlace.id);
    await loadCourse();
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

  function toggleDay(day: number) {
    setCollapsedDays(function(prev) {
      var next = { ...prev };
      next[day] = !next[day];
      return next;
    });
  }

  var typeLabels: Record<string, Record<string, string>> = {
    restaurant: { ko: '음식점', en: 'Restaurant', ja: 'レストラン', zh: '餐厅' },
    accommodation: { ko: '숙소', en: 'Hotel', ja: '宿泊', zh: '住宿' },
    attraction: { ko: '관광지', en: 'Attraction', ja: '観光地', zh: '景点' },
  };

  var typeColors: Record<string, string> = {
    restaurant: 'bg-orange-100 text-orange-700',
    accommodation: 'bg-teal-100 text-teal-700',
    attraction: 'bg-purple-100 text-purple-700',
  };

  var labels: Record<string, Record<string, string>> = {
    addDay: { ko: '일자 추가', en: 'Add Day', ja: '日程追加', zh: '添加日程' },
    removeDay: { ko: '일자 삭제', en: 'Remove Day', ja: '日程削除', zh: '删除日程' },
    addPlace: { ko: '장소 추가', en: 'Add Place', ja: '場所追加', zh: '添加地点' },
    searchPlace: { ko: '장소를 검색하세요', en: 'Search places', ja: '場所を検索', zh: '搜索地点' },
    noPlaces: { ko: '아직 장소가 없습니다', en: 'No places yet', ja: 'まだ場所がありません', zh: '还没有地点' },
    addPlaceHint: { ko: '아래 버튼으로 장소를 추가하세요', en: 'Add places using the button below', ja: '下のボタンから場所を追加', zh: '使用下方按钮添加地点' },
    showRoute: { ko: '경로 보기', en: 'View Route', ja: 'ルート表示', zh: '查看路线' },
    hideRoute: { ko: '경로 숨기기', en: 'Hide Route', ja: 'ルート非表示', zh: '隐藏路线' },
    places: { ko: '개 장소', en: ' places', ja: '箇所', zh: '个地点' },
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

  var days = getDays();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-4">
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

      {/* 경로 보기 */}
      <div className="mb-4">
        <button
          onClick={function() { setShowMap(!showMap); }}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Map size={16} />
          {showMap ? labels.hideRoute[locale] : labels.showRoute[locale]}
        </button>
        {showMap && (
          <div className="mt-3 rounded-2xl overflow-hidden border shadow-sm">
            <div style={{ position: 'relative' }}>
              <div ref={mapContainerRef} style={{ height: '350px', width: '100%' }} />
              <button
                onClick={function() {
                  if (mapInstanceRef2.current && course) {
                    setTransitInfo([]);
                    drawRoute(mapInstanceRef2.current, course);
                  }
                }}
                className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white text-sm font-medium text-gray-700 rounded-lg shadow-md border hover:bg-gray-50 active:bg-gray-100 transition"
              >
                🔄 {locale === 'ko' ? '경로 갱신' : locale === 'ja' ? 'ルート更新' : locale === 'zh' ? '更新路线' : 'Refresh Route'}
              </button>
            </div>
            {/* 안내 문구 */}
            <div className="px-3 py-2 bg-amber-50 border-t border-amber-100">
              <p className="text-xs text-amber-600">
                ⚠️ {locale === 'ko' ? '주소 정보가 없는 장소는 지도와 경로에 표시되지 않습니다.' :
                    locale === 'ja' ? '住所情報のない場所は地図とルートに表示されません。' :
                    locale === 'zh' ? '没有地址信息的地点不会显示在地图和路线上。' :
                    'Places without address info will not appear on the map or route.'}
              </p>
            </div>
            {transitInfo.length > 0 && (
              <div className="p-3 space-y-2 bg-gray-50 max-h-60 overflow-y-auto">
                {transitInfo.map(function(info, idx) {
                  if (!info) return null;
                  return (
                    <div key={idx} className="bg-white rounded-xl p-3 border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-700">
                          {info.from} → {info.to}
                        </span>
                        {info.duration && (
                          <span className="text-xs text-blue-600 font-semibold">{info.duration}</span>
                        )}
                      </div>
                      {info.steps.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {info.steps.map(function(step: any, si: number) {
                            var icon = step.vehicle === 'SUBWAY' ? '🚇' :
                                       step.vehicle === 'BUS' ? '🚌' :
                                       step.vehicle === 'HEAVY_RAIL' ? '🚆' : '🚍';
                            return (
                              <div key={si} className="flex items-center gap-1.5 text-xs flex-wrap">
                                <span
                                  className="px-2 py-0.5 rounded-full font-bold"
                                  style={{ backgroundColor: step.color, color: step.textColor }}
                                >
                                  {icon} {step.name}
                                </span>
                                <span className="text-gray-500">
                                  {step.departure} → {step.arrival}
                                </span>
                                <span className="text-gray-400">({step.numStops}{locale === 'ko' ? '정거장' : locale === 'ja' ? '駅' : locale === 'zh' ? '站' : ' stops'})</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {info.duration ? (locale === 'ko' ? '도보 이동' : locale === 'ja' ? '徒歩移動' : locale === 'zh' ? '步行' : 'Walking') : (locale === 'ko' ? '경로 정보 없음' : 'No route info')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 일자별 장소 */}
      <div className="space-y-4">
        {days.map(function(day) {
          var dayPlaces = getPlacesForDay(day);
          var isCollapsed = collapsedDays[day];

          return (
            <div key={day} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              {/* 일자 헤더 */}
              <div
                className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                onClick={function() { toggleDay(day); }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 rounded-full">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-sm font-bold text-blue-700">Day {day}</span>
                  </div>
                  <span className="text-xs text-gray-400">{dayPlaces.length}{labels.places[locale]}</span>
                </div>
                <div className="flex items-center gap-2">
                  {days.length > 1 && (
                    <button
                      onClick={function(e) { e.stopPropagation(); handleRemoveDay(day); }}
                      className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  {isCollapsed ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
                </div>
              </div>

              {/* 장소 목록 */}
              {!isCollapsed && (
                <div className="p-3">
                  {dayPlaces.length === 0 ? (
                    <div className="text-center py-6">
                      <MapPin size={24} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-400">{labels.noPlaces[locale]}</p>
                      <p className="text-xs text-gray-300">{labels.addPlaceHint[locale]}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dayPlaces.map(function(place, index) {
                        return (
                          <div key={place.id} className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-gray-50 transition">
                            <div className="flex flex-col gap-0.5">
                              <button
                                onClick={function() { handleMoveUp(place, dayPlaces, index); }}
                                disabled={index === 0}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs leading-none"
                              >▲</button>
                              <span className="text-xs text-gray-300 text-center leading-none">{index + 1}</span>
                              <button
                                onClick={function() { handleMoveDown(place, dayPlaces, index); }}
                                disabled={index === dayPlaces.length - 1}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs leading-none"
                              >▼</button>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={'text-xs px-2 py-0.5 rounded-full ' + (typeColors[place.place_type] || 'bg-gray-100 text-gray-600')}>
                                  {(typeLabels[place.place_type] || {})[locale] || place.place_type}
                                </span>
                                <span className="font-medium text-sm truncate">{place.place_name}</span>
                              </div>
                              {place.place_address && (
                                <p className="text-xs text-gray-400 truncate pl-1">{place.place_address}</p>
                              )}
                              {place.memo && (
                                <p className="text-xs text-amber-600 mt-1 pl-1">💡 {place.memo}</p>
                              )}
                            </div>
                            {place.place_rating && (
                              <span className="text-xs text-yellow-500 shrink-0">★ {place.place_rating.toFixed(1)}</span>
                            )}
                            <button
                              onClick={function() { handleRemovePlace(place.id); }}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 장소 추가 버튼 */}
                  <button
                    onClick={function() { setSearchDay(searchDay === day ? null : day); setSearchQuery(''); setSearchResults([]); }}
                    className="flex items-center gap-1.5 w-full mt-2 p-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-blue-400 hover:text-blue-500 transition text-sm justify-center"
                  >
                    <Plus size={16} />
                    {labels.addPlace[locale]}
                  </button>

                  {/* 검색 패널 */}
                  {searchDay === day && (
                    <div className="mt-3 bg-gray-50 rounded-xl p-3">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={function(e) { setSearchQuery(e.target.value); }}
                          onKeyDown={function(e) { if (e.key === 'Enter') handleSearch(); }}
                          placeholder={labels.searchPlace[locale]}
                          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          autoFocus
                        />
                        <button
                          onClick={handleSearch}
                          disabled={searching}
                          className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Search size={16} />
                        </button>
                      </div>

                      {searching && (
                        <div className="text-center py-3">
                          <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                        </div>
                      )}

                      {searchResults.length > 0 && (
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {searchResults.map(function(result) {
                            return (
                              <div
                                key={result.type + '-' + result.id}
                                className="flex items-center justify-between p-2 hover:bg-white rounded-lg cursor-pointer transition"
                                onClick={function() { handleAddPlace(result, day); }}
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={'text-xs px-2 py-0.5 rounded-full shrink-0 ' + (typeColors[result.type] || 'bg-gray-100 text-gray-600')}>
                                      {(typeLabels[result.type] || {})[locale] || result.type}
                                    </span>
                                    <span className="font-medium text-sm truncate">{result.name}</span>
                                  </div>
                                  {result.address && (
                                    <p className="text-xs text-gray-400 mt-0.5 truncate">{result.address}</p>
                                  )}
                                </div>
                                <Plus size={16} className="text-blue-500 shrink-0 ml-2" />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {searchResults.length === 0 && searchQuery && !searching && (
                        <p className="text-center text-sm text-gray-400 py-2">{t('explore.noResults')}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 일자 추가 버튼 */}
      <button
        onClick={handleAddDay}
        className="flex items-center gap-2 w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition justify-center font-medium"
      >
        <Calendar size={18} />
        {labels.addDay[locale]}
      </button>
    </div>
  );
}
