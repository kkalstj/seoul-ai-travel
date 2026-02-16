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

interface KakaoMapProps {
  places?: MapPlace[];
  selectedPlaceId?: string | null;
  onMarkerClick?: (place: MapPlace) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

declare global {
  interface Window {
    kakao: any;
  }
}

function waitForKakao(): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = setInterval(() => {
      attempts++;
      console.log(`[KakaoMap] 시도 ${attempts}:`, {
        kakao: !!window.kakao,
        maps: !!(window.kakao && window.kakao.maps),
        LatLng: !!(window.kakao && window.kakao.maps && window.kakao.maps.LatLng),
      });
      
      if (window.kakao && window.kakao.maps) {
        if (window.kakao.maps.LatLng) {
          clearInterval(check);
          console.log('[KakaoMap] 이미 로드됨!');
          resolve();
        } else {
          clearInterval(check);
          console.log('[KakaoMap] maps.load() 호출');
          window.kakao.maps.load(() => {
            console.log('[KakaoMap] maps.load() 완료!');
            resolve();
          });
        }
      } else if (attempts > 100) {
        clearInterval(check);
        reject(new Error('Kakao Maps SDK 로드 시간 초과'));
      }
    }, 300);
  });
}

export default function KakaoMap({
  places = [],
  selectedPlaceId,
  onMarkerClick,
  center = SEOUL_CENTER,
  zoom = DEFAULT_ZOOM,
  className = '',
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const overlayRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    waitForKakao()
      .then(() => {
        if (!mapRef.current) return;

        const options = {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level: zoom,
        };

        const map = new window.kakao.maps.Map(mapRef.current, options);
        mapInstanceRef.current = map;

        const zoomControl = new window.kakao.maps.ZoomControl();
        map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

        setIsReady(true);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  useEffect(() => {
    if (!isReady || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (overlayRef.current) {
      overlayRef.current.setMap(null);
      overlayRef.current = null;
    }

    if (places.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds();

    places.forEach((place) => {
      if (!place.latitude || !place.longitude) return;

      const position = new window.kakao.maps.LatLng(place.latitude, place.longitude);
      const color = PLACE_COLORS[place.type] || '#666';
      const isSelected = place.id === selectedPlaceId;
      const size = isSelected ? 16 : 10;

      const markerContent = document.createElement('div');
      markerContent.innerHTML = `
        <div style="
          width: ${size}px; height: ${size}px;
          background: ${color}; border: 2px solid white;
          border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer; transition: all 0.2s;
          ${isSelected ? 'transform: scale(1.3);' : ''}
        "></div>
      `;

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position, content: markerContent, yAnchor: 0.5, xAnchor: 0.5,
      });

      customOverlay.setMap(map);
      markersRef.current.push(customOverlay);

      markerContent.addEventListener('click', () => {
        if (overlayRef.current) overlayRef.current.setMap(null);

        const ratingHtml = place.rating
          ? `<span style="color: #f59e0b; font-size: 12px;">★ ${place.rating.toFixed(1)}</span>` : '';
        const categoryHtml = place.category
          ? `<span style="background: ${color}20; color: ${color}; padding: 1px 6px; border-radius: 8px; font-size: 11px;">${place.category}</span>` : '';

        const infoContent = document.createElement('div');
        infoContent.innerHTML = `
          <div style="background: white; border-radius: 12px; padding: 12px 14px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15); min-width: 180px; max-width: 250px; position: relative;">
            <div style="font-weight: 700; font-size: 14px; color: #111; margin-bottom: 4px;">${place.name}</div>
            <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 4px;">${categoryHtml} ${ratingHtml}</div>
            ${place.address ? `<div style="font-size: 12px; color: #888; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${place.address}</div>` : ''}
            <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%);
              width: 0; height: 0; border-left: 8px solid transparent;
              border-right: 8px solid transparent; border-top: 8px solid white;"></div>
          </div>
        `;

        const infoOverlay = new window.kakao.maps.CustomOverlay({
          position, content: infoContent, yAnchor: 1.5,
        });

        infoOverlay.setMap(map);
        overlayRef.current = infoOverlay;
        map.panTo(position);

        if (onMarkerClick) onMarkerClick(place);
      });

      bounds.extend(position);
    });

    if (places.length > 1) {
      map.setBounds(bounds);
    } else if (places.length === 1 && places[0].latitude && places[0].longitude) {
      map.setCenter(new window.kakao.maps.LatLng(places[0].latitude, places[0].longitude));
      map.setLevel(5);
    }
  }, [isReady, places, selectedPlaceId, onMarkerClick]);

  useEffect(() => {
    if (!isReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const clickListener = () => {
      if (overlayRef.current) { overlayRef.current.setMap(null); overlayRef.current = null; }
    };
    window.kakao.maps.event.addListener(map, 'click', clickListener);
    return () => { window.kakao.maps.event.removeListener(map, 'click', clickListener); };
  }, [isReady]);

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

