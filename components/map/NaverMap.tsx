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

interface LeafletMapProps {
  places?: MapPlace[];
  selectedPlaceId?: string | null;
  onMarkerClick?: (place: MapPlace) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

declare global {
  interface Window {
    L: any;
  }
}

function loadLeaflet(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve();
      return;
    }

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    var script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = function() { resolve(); };
    script.onerror = function() { reject(new Error('Leaflet 로드 실패')); };
    document.head.appendChild(script);
  });
}

export default function KakaoMap({
  places = [],
  selectedPlaceId,
  onMarkerClick,
  center = SEOUL_CENTER,
  zoom = DEFAULT_ZOOM,
  className = '',
}: LeafletMapProps) {
  var mapRef = useRef<HTMLDivElement>(null);
  var mapInstanceRef = useRef<any>(null);
  var markersRef = useRef<any[]>([]);
  var [isReady, setIsReady] = useState(false);
  var [error, setError] = useState<string | null>(null);

  useEffect(function() {
    loadLeaflet()
      .then(function() {
        if (!mapRef.current) return;
        if (mapInstanceRef.current) return;

        var map = window.L.map(mapRef.current).setView([center.lat, center.lng], 14);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        setIsReady(true);
      })
      .catch(function(err: any) {
        setError(err.message);
      });

    return function() {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(function() {
    if (!isReady || !mapInstanceRef.current) return;

    var map = mapInstanceRef.current;

    markersRef.current.forEach(function(marker) { map.removeLayer(marker); });
    markersRef.current = [];

    if (places.length === 0) return;

    var bounds: any[] = [];

    places.forEach(function(place) {
      if (!place.latitude || !place.longitude) return;

      var color = PLACE_COLORS[place.type] || '#666';
      var isSelected = place.id === selectedPlaceId;
      var size = isSelected ? 16 : 10;

      var icon = window.L.divIcon({
        html: '<div style="width: ' + size + 'px; height: ' + size + 'px; background: ' + color + '; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      var marker = window.L.marker([place.latitude, place.longitude], { icon: icon }).addTo(map);

      var ratingText = place.rating ? ' ★ ' + place.rating.toFixed(1) : '';
      var categoryText = place.category ? '<span style="background: ' + color + '20; color: ' + color + '; padding: 1px 6px; border-radius: 8px; font-size: 11px;">' + place.category + '</span>' : '';
      var ratingHtml = ratingText ? '<span style="color: #f59e0b; font-size: 12px;">' + ratingText + '</span>' : '';
      var addressHtml = place.address ? '<div style="font-size: 12px; color: #888; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">' + place.address + '</div>' : '';

      var popupHtml = '<div style="min-width: 180px;">' +
        '<div style="font-weight: 700; font-size: 14px; color: #111; margin-bottom: 4px;">' + place.name + '</div>' +
        '<div style="display: flex; gap: 6px; align-items: center; margin-bottom: 4px;">' + categoryText + ratingHtml + '</div>' +
        addressHtml +
        '</div>';

      marker.bindPopup(popupHtml, { closeButton: true, className: 'custom-popup' });

      marker.on('click', function() {
        map.setView([place.latitude, place.longitude], map.getZoom());
        if (onMarkerClick) onMarkerClick(place);
      });

      markersRef.current.push(marker);
      bounds.push([place.latitude, place.longitude]);
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [30, 30] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 15);
    }
  }, [isReady, places, selectedPlaceId, onMarkerClick]);

  if (error) {
    return (
      <div className={'flex items-center justify-center bg-gray-100 rounded-xl ' + className}>
        <div className="text-center p-6">
          <p className="text-red-500 font-medium">지도를 불러올 수 없습니다</p>
          <p className="text-gray-400 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={'relative ' + className}>
      <div ref={mapRef} className="w-full h-full rounded-xl" style={{ minHeight: '400px' }} />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
