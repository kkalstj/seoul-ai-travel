'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import SearchBar from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import CategoryFilter from '@/components/filters/CategoryFilter';
import PlaceCard from '@/components/cards/PlaceCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import KakaoMap from '@/components/map/NaverMap';
import type { MapPlace } from '@/components/map/KakaoMap';
import {
  EXPLORE_TABS,
  FOOD_TYPES,
  ACCOMMODATION_TYPES,
  PAGE_SIZE,
} from '@/lib/utils/constants';
import { Map, List, X } from 'lucide-react';
import ReviewModal from '@/components/reviews/ReviewModal';

type TabKey = 'restaurant' | 'accommodation' | 'attraction';
type ViewMode = 'list' | 'map' | 'split';

export default function ExplorePage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>('restaurant');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [reviewPlace, setReviewPlace] = useState<any>(null);
  
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // 데이터 조회
  const fetchData = useCallback(async () => {
    setLoading(true);

    const tableName =
      activeTab === 'restaurant'
        ? 'restaurants'
        : activeTab === 'accommodation'
        ? 'accommodations'
        : 'attractions';

    const categoryColumn =
      activeTab === 'restaurant'
        ? 'food_type'
        : activeTab === 'accommodation'
        ? 'accommodation_type'
        : 'category';

    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase.from(tableName).select('*', { count: 'exact' });

    if (searchKeyword) {
      query = query.ilike('name', `%${searchKeyword}%`);
    }

    if (selectedCategory) {
      query = query.eq(categoryColumn, selectedCategory);
    }

    if (activeTab === 'attraction') {
      query = query.order('name', { ascending: true });
    } else {
      query = query.order('rating', { ascending: false, nullsFirst: false });
    }

    query = query.range(from, to);

    const { data: result, count, error } = await query;

    if (error) {
      console.error('데이터 조회 에러:', error);
    } else {
      setData(result || []);
      setTotalCount(count || 0);
    }

    setLoading(false);
  }, [activeTab, currentPage, searchKeyword, selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 탭 변경 시 초기화
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchKeyword('');
    setSelectedCategory(null);
    setSelectedPlaceId(null);
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  };

  const handleCategorySelect = (value: string | null) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const getCategoryOptions = () => {
    if (activeTab === 'restaurant') return FOOD_TYPES;
    if (activeTab === 'accommodation') return ACCOMMODATION_TYPES;
    return [];
  };

  // 지도용 데이터 변환
  const mapPlaces: MapPlace[] = data
    .filter((item) => item.latitude && item.longitude)
    .map((item) => ({
      id: item.id,
      name: item.name,
      type: activeTab,
      latitude: item.latitude,
      longitude: item.longitude,
      address: item.address,
      rating: item.rating,
      category:
        activeTab === 'restaurant'
          ? item.food_type
          : activeTab === 'accommodation'
          ? item.accommodation_type
          : item.category,
    }));

  const handleMarkerClick = (place: MapPlace) => {
    setSelectedPlaceId(place.id);
  };

  const handleCardClick = (id: string) => {
    setSelectedPlaceId(selectedPlaceId === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 페이지 제목 + 뷰 모드 토글 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('explore.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('explore.subtitle')}</p>
        </div>

        {/* 뷰 모드 전환 버튼 */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
            }`}
            title="리스트만"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'split' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
            }`}
            title="리스트 + 지도"
          >
            <Map className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'map' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
            }`}
            title="지도만"
          >
            <Map className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        {EXPLORE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <div className="mb-4">
        <SearchBar
          placeholder={activeTab === 'restaurant' ? t('explore.searchRestaurant') : activeTab === 'accommodation' ? t('explore.searchAccommodation') : t('explore.searchAttraction')}
          onSearch={handleSearch}
        />
      </div>

      {/* 카테고리 필터 */}
      {getCategoryOptions().length > 0 && (
        <div className="mb-4 overflow-x-auto pb-2">
          <CategoryFilter
            options={getCategoryOptions()}
            selected={selectedCategory}
            onSelect={handleCategorySelect}
          />
        </div>
      )}

      {/* 결과 건수 */}
      <div className="mb-4 text-sm text-gray-500">
        {t('explore.total')} <span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span> {t('explore.count')}
        {searchKeyword && (
          <span>
            {' · '}검색: <span className="text-blue-600">"{searchKeyword}"</span>
          </span>
        )}
        {selectedCategory && (
          <span>
            {' · '}필터: <span className="text-blue-600">{selectedCategory}</span>
          </span>
        )}
      </div>

      {/* 메인 콘텐츠: 리스트 + 지도 */}
      <div className={`flex gap-4 ${viewMode === 'map' ? 'flex-col' : ''}`}>
        {/* 리스트 영역 */}
        {(viewMode === 'list' || viewMode === 'split') && (
          <div className={viewMode === 'split' ? 'w-full md:w-1/2' : 'w-full'}>
            {loading ? (
              <LoadingSpinner />
            ) : data.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg">{t('explore.noResults')}</p>
                <p className="text-sm mt-1">{t('explore.tryOther')}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
                {data.map((item) => (
                  <div
                    key={item.id}
                    className={`transition-all ${
                      selectedPlaceId === item.id ? 'ring-2 ring-blue-500 rounded-xl' : ''
                    }`}
                  >
                    <PlaceCard
                      id={item.id}
                      name={item.name}
                      type={activeTab}
                      address={item.address}
                      rating={item.rating}
                      latitude={item.latitude}
                      longitude={item.longitude}
                      category={
                        activeTab === 'restaurant'
                          ? item.food_type
                          : activeTab === 'accommodation'
                          ? item.accommodation_type
                          : item.category
                     }
                     description={item.description}
                     reviewCount={item.review_count}
                     onClick={() => handleCardClick(item.id)}
                     onReviewClick={() => setReviewPlace({ id: item.id, name: item.name, type: activeTab })}
                   />
                  </div>
                ))}
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* 지도 영역 */}
        {(viewMode === 'map' || viewMode === 'split') && (
          <div
            className={`${
              viewMode === 'split' ? 'hidden md:block md:w-1/2' : 'w-full'
            }`}
          >
            <div className="sticky top-20">
              <KakaoMap
                places={mapPlaces}
                selectedPlaceId={selectedPlaceId}
                onMarkerClick={handleMarkerClick}
                className="h-[calc(100vh-320px)] min-h-[400px]"
              />
              {/* 지도 위 장소 수 표시 */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md text-xs font-medium text-gray-700 z-10">
                {mapPlaces.length} {t('explore.showOnMap')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 모바일: 지도 토글 버튼 */}
      <div className="fixed bottom-20 right-4 md:hidden z-40">
        <button
          onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-300 hover:bg-blue-700 transition-all"
        >
          {viewMode === 'list' ? (
            <>
              <Map className="w-4 h-4" />
              <span className="text-sm font-medium">{t('explore.mapView')}</span>
            </>
          ) : (
            <>
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">{t('explore.listView')}</span>
            </>
          )}
        </button>
      </div>
    {reviewPlace && (
      <ReviewModal
       placeId={reviewPlace.id}
       placeType={reviewPlace.type}
       placeName={reviewPlace.name}
       onClose={() => setReviewPlace(null)}
       onReviewAdded={() => fetchData()} 
     />
   )}
    </div>
  );

}






