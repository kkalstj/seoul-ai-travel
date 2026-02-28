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

interface GoogleMapProps {
  places?: MapPlace[];
  selectedPlaceId?: string | null;
  onMarkerClick?: (place: MapPlace) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
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
    script.onerror = function() { reject(new Error('Google Maps 로드 실패')); };
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
}: GoogleMapProps) {
  var mapRef = useRef<HTMLDivElement>(null);
  var mapInstanceRef = useRef<any>(null);
  var markersRef = useRef<any[]>([]);
  var infoWindowRef = useRef<any>(null);
  var [isReady, setIsReady] = useState(false);
  var [error, setError] = useState<string | null>(null);

  useEffect(function() {
    loadGoogleMaps()
      .then(function() {
        if (!mapRef.current || mapInstanceRef.current) return;

        var google = (window as any).google;

        var map = new google.maps.Map(mapRef.current, {
          center: { lat: center.lat, lng: center.lng },
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        infoWindowRef.current = new google.maps.InfoWindow();
        mapInstanceRef.current = map;
        setIsReady(true);
      })
      .catch(function(err: any) {
        setError(err.message);
      });

    return function() {
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(function() {
    if (!isReady || !mapInstanceRef.current) return;

    var google = (window as any).google;
    var map = mapInstanceRef.current;

    markersRef.current.forEach(function(marker) { marker.setMap(null); });
    markersRef.current = [];

    if (places.length === 0) return;

    var bounds = new google.maps.LatLngBounds();

    places.forEach(function(place) {
      if (!place.latitude || !place.longitude) return;

      var color = PLACE_COLORS[place.type] || '#666';
      var isSelected = place.id === selectedPlaceId;
      var scale = isSelected ? 12 : 8;

      var marker = new google.maps.Marker({
        position: { lat: place.latitude, lng: place.longitude },
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: scale,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
        },
        title: place.name,
      });

      var ratingText = place.rating ? ' ★ ' + place.rating.toFixed(1) : '';
      var categoryHtml = place.category ? '<span style="background:' + color + '20;color:' + color + ';padding:1px 6px;border-radius:8px;font-size:11px;">' + place.category + '</span>' : '';
      var ratingHtml = ratingText ? '<span style="color:#f59e0b;font-size:12px;">' + ratingText + '</span>' : '';
      var addressHtml = place.address ? '<div style="font-size:12px;color:#888;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;">' + place.address + '</div>' : '';

      var contentHtml = '<div style="min-width:180px;">' +
        '<div style="font-weight:700;font-size:14px;color:#111;margin-bottom:4px;">' + place.name + '</div>' +
        '<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px;">' + categoryHtml + ratingHtml + '</div>' +
        addressHtml +
        '</div>';

      marker.addListener('click', function() {
        infoWindowRef.current.setContent(contentHtml);
        infoWindowRef.current.open(map, marker);
        map.panTo(marker.getPosition());
        if (onMarkerClick) onMarkerClick(place);
      });

      markersRef.current.push(marker);
      bounds.extend(marker.getPosition());
    });

    if (places.length > 1) {
      map.fitBounds(bounds, { padding: 30 });
    } else if (places.length === 1) {
      map.setCenter({ lat: places[0].latitude, lng: places[0].longitude });
      map.setZoom(15);
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
    <div className={'relative ' + className} style={{ position: 'relative', zIndex: 1 }}>
      <div ref={mapRef} className="w-full h-full rounded-xl" style={{ minHeight: '300px' }} />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
