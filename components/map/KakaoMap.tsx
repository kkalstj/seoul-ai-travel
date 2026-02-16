'use client';

import { useEffect, useRef, useState } from 'react';
import { SEOUL_CENTER, DEFAULT_ZOOM, PLACE_COLORS } from '@/lib/utils/constants';

export interface MapPlace {
  id: string;
  name: string;
  type: 'restaurant' | 'accommodation' | 'attraction' | 'subway';
  latitude: number;
  longitude: number;
  address?: string | null;
  rating?: number | null;
  category?: string | null;
}

interface NaverMapProps {
  places?: MapPlace[];
  selectedPlaceId?: string | null;
  onMarkerClick?: (place: MapPlace) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

declare global {
  interface Window {
    naver: any;
  }
}

function waitForNaver(): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = setInterval(() => {
      attempts++;
      if (window.naver && window.naver.maps) {
        clearInterval(check);
        resolve();
      } else if (attempts > 100) {
        clearInterval(check);
        reject(new Error('Naver Maps SDK 로드 시간 초과'));
      }
    }, 200);
  });
}

export default function KakaoMap({
  places = [],
  selectedPlaceId,
  onMarkerClick,
  center = SEOUL_CENTER,
  zoom = DEFAULT_ZOOM,
  className = '',
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 지도 초기화
  useEffect(() => {
    waitForNaver()
      .then(() => {
        if (!mapRef.current) return;

        const map = new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(center.lat, center.lng),
          zoom: 15 - zoom + 3,
          zoomControl: true,
          zoomControlOptions: {
            position: window.naver.maps.Position.TOP_RIGHT,
          },
        });

        mapInstanceRef.current = map;

        // 지도 클릭 시 정보창 닫기
        window.naver.maps.Event.addListener(map, 'click', () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }
        });

        setIsReady(true);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  // 마커 업데이트
  useEffect(() => {
    if (!isReady || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (places.length === 0) return;

    const bounds = new window.naver.maps.LatLngBounds();

    places.forEach((place) => {
      if (!place.latitude || !place.longitude) return;

      const position = new window.naver.maps.LatLng(place.latitude, place.longitude);
      const color = PLACE_COLORS[place.type] || '#666';
      const isSelected = place.id === selectedPlaceId;
      const size = isSelected ? 16 : 10;

      const marker = new window.naver.maps.Marker({
        position,
        map,
        icon: {
          content: `<div style="
            width: ${size}px; height: ${size}px;
            background: ${color}; border: 2px solid white;
            border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            cursor: pointer; transition: all 0.2s;
            ${isSelected ? 'transform: scale(1.3);' : ''}
          "></div>`,
          anchor: new window.naver.maps.Point(size / 2, size / 2),
        },
      });

      markersRef.current.push(marker);

      // 클릭 이벤트
      window.naver.maps.Event.addListener(marker, 'click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }

        const ratingHtml = place.rating
          ? `<span style="color: #f59e0b; font-size: 12px;">★ ${place.rating.toFixed(1)}</span>` : '';
        const categoryHtml = place.category
          ? `<span style="background: ${color}20; color: ${color}; padding: 1px 6px; border-radius: 8px; font-size: 11px;">${place.category}</span>` : '';

        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="background: white; border-radius: 12px; padding: 12px 14px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.15); min-width: 180px; max-width: 250px;">
              <div style="font-weight: 700; font-size: 14px; color: #111; margin-bottom: 4px;">${place.name}</div>
              <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 4px;">${categoryHtml} ${ratingHtml}</div>
              ${place.address ? `<div style="font-size: 12px; color: #888; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${place.address}</div>` : ''}
            </div>
          `,
          borderWidth: 0,
          backgroundColor: 'transparent',
          disableAnchor: true,
          pixelOffset: new window.naver.maps.Point(0, -10),
        });

        infoWindow.open(map, marker);
        infoWindowRef.current = infoWindow;

        map.panTo(position);

        if (onMarkerClick) onMarkerClick(place);
      });

      bounds.extend(position);
    });

    // 모든 마커가 보이도록 지도 범위 조정
    if (places.length > 1) {
      map.fitBounds(bounds);
    } else if (places.length === 1 && places[0].latitude && places[0].longitude) {
      map.setCenter(new window.naver.maps.LatLng(places[0].latitude, places[0].longitude));
      map.setZoom(15);
    }
  }, [isReady, places, selectedPlaceId, onMarkerClick]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-xl ${className}`}>
        <div className="text-center p-6">
          <p className="text-red-500 font-medium">지도를 불러올 수 없습니다</p>
          <p className="text-gray-400 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-xl" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
