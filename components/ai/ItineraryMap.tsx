'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { supabase } from '@/lib/supabase/client';
import { Car, PersonStanding, Train } from 'lucide-react';

interface Place {
  name: string;
  type: string;
  time: string;
  duration: string;
  tip: string;
}

interface Day {
  day: number;
  theme: string;
  places: Place[];
}

interface Itinerary {
  title: string;
  description: string;
  days: Day[];
}

interface ItineraryMapProps {
  itinerary: Itinerary;
}

var typeColors: Record<string, string> = {
  restaurant: '#F97316',
  accommodation: '#14B8A6',
  attraction: '#8B5CF6',
};

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

export default function ItineraryMap({ itinerary }: ItineraryMapProps) {
  var { t } = useLanguage();
  var mapRef = useRef<HTMLDivElement>(null);
  var mapInstanceRef = useRef<any>(null);
  var markersRef = useRef<any[]>([]);
  var directionsRendererRef = useRef<any>(null);
  var coordsRef = useRef<{ lat: number; lng: number }[]>([]);
  var [loading, setLoading] = useState(true);
  var [travelMode, setTravelMode] = useState<string>('TRANSIT');
  var [mapReady, setMapReady] = useState(false);

  useEffect(function() {
    if (!mapRef.current) return;
    var cancelled = false;

    async function init() {
      try {
        await loadGoogleMaps();
        if (cancelled || !mapRef.current) return;

        var google = (window as any).google;

        var map = new google.maps.Map(mapRef.current, {
          center: { lat: 37.5665, lng: 126.978 },
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = map;

        var allPlaces: { name: string; type: string; order: number }[] = [];
        itinerary.days.forEach(function(day) {
          day.places.forEach(function(place) {
            allPlaces.push({
              name: place.name.replace(/\s*\(.*?\)\s*/g, '').trim(),
              type: place.type || 'attraction',
              order: allPlaces.length + 1,
            });
          });
        });

        var coords: { lat: number; lng: number }[] = [];
        var bounds = new google.maps.LatLngBounds();

        for (var i = 0; i < allPlaces.length; i++) {
          var place = allPlaces[i];
          var found = false;

          var tables = ['restaurants', 'accommodations', 'attractions'];
          for (var t2 = 0; t2 < tables.length; t2++) {
            var { data } = await supabase
              .from(tables[t2])
              .select('name, latitude, longitude')
              .ilike('name', '%' + place.name + '%')
              .limit(1);

            if (data && data.length > 0 && data[0].latitude && data[0].longitude) {
              var pos = { lat: data[0].latitude, lng: data[0].longitude };
              coords.push(pos);
              bounds.extend(pos);

              var color = typeColors[place.type] || '#8B5CF6';
              var marker = new google.maps.Marker({
                position: pos,
                map: map,
                label: { text: String(place.order), color: 'white', fontWeight: 'bold', fontSize: '12px' },
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 16, fillColor: color, fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 },
                title: place.name,
              });

              var infoWindow = new google.maps.InfoWindow({
                content: '<div style="font-size:13px;font-weight:bold;padding:4px;">' + place.order + '. ' + place.name + '</div>',
              });

              (function(m, iw) {
                m.addListener('click', function() { iw.open(map, m); });
              })(marker, infoWindow);

              markersRef.current.push(marker);
              found = true;
              break;
            }
          }

          if (!found) {
            try {
              var geocoder = new google.maps.Geocoder();
              var result = await new Promise(function(resolve, reject) {
                geocoder.geocode({ address: place.name + ' 서울' }, function(results: any, status: any) {
                  if (status === 'OK' && results.length > 0) resolve(results[0]);
                  else reject(new Error('Geocode failed'));
                });
              }) as any;

              var pos2 = { lat: result.geometry.location.lat(), lng: result.geometry.location.lng() };
              coords.push(pos2);
              bounds.extend(pos2);

              var color2 = typeColors[place.type] || '#8B5CF6';
              var marker2 = new google.maps.Marker({
                position: pos2,
                map: map,
                label: { text: String(place.order), color: 'white', fontWeight: 'bold', fontSize: '12px' },
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 16, fillColor: color2, fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 },
                title: place.name,
              });
              markersRef.current.push(marker2);
            } catch (geoErr) {
              console.error('Geocode error:', place.name, geoErr);
            }
          }
        }

        coordsRef.current = coords;

        if (coords.length > 1) {
          map.fitBounds(bounds, { padding: 50 });
        } else if (coords.length === 1) {
          map.setCenter(coords[0]);
          map.setZoom(15);
        }

        setMapReady(true);
        setLoading(false);
      } catch (err) {
        console.error('Map init error:', err);
        setLoading(false);
      }
    }

    init();

    return function() { cancelled = true; };
  }, [itinerary]);

  useEffect(function() {
    if (!mapReady || coordsRef.current.length < 2 || !mapInstanceRef.current) return;

    var google = (window as any).google;
    var map = mapInstanceRef.current;
    var coords = coordsRef.current;

    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }

    var renderer = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#4285F4',
        strokeWeight: 5,
        strokeOpacity: 0.8,
      },
    });
    directionsRendererRef.current = renderer;

    var directionsService = new google.maps.DirectionsService();
    var origin = coords[0];
    var destination = coords[coords.length - 1];
    var waypoints = coords.slice(1, -1).map(function(c) {
      return { location: c, stopover: true };
    });

    var mode = google.maps.TravelMode[travelMode];

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: mode,
        region: 'kr',
      },
      function(result: any, status: any) {
        if (status === 'OK') {
          renderer.setDirections(result);
        } else {
          console.error('Directions failed:', status);
        }
      }
    );
  }, [travelMode, mapReady]);

  var modeLabels: Record<string, Record<string, string>> = {
    DRIVING: { ko: '자동차', en: 'Drive', ja: '車', zh: '驾车' },
    TRANSIT: { ko: '대중교통', en: 'Transit', ja: '電車', zh: '公交' },
    WALKING: { ko: '도보', en: 'Walk', ja: '徒歩', zh: '步行' },
  };

  var locale = useLanguage().locale;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="relative">
        <div ref={mapRef} style={{ height: '300px', width: '100%' }} />
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              {t('ai.mapLoading')}
            </div>
          </div>
        )}
        {mapReady && coordsRef.current.length > 1 && (
          <div className="absolute top-3 right-3 bg-white rounded-lg shadow-md flex overflow-hidden text-xs z-10">
            <button
              onClick={function() { setTravelMode('TRANSIT'); }}
              className={'flex items-center gap-1 px-3 py-2 transition ' + (travelMode === 'TRANSIT' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100')}
            >
              <Train size={14} />
              {modeLabels.TRANSIT[locale]}
            </button>
            <button
              onClick={function() { setTravelMode('DRIVING'); }}
              className={'flex items-center gap-1 px-3 py-2 transition ' + (travelMode === 'DRIVING' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100')}
            >
              <Car size={14} />
              {modeLabels.DRIVING[locale]}
            </button>
            <button
              onClick={function() { setTravelMode('WALKING'); }}
              className={'flex items-center gap-1 px-3 py-2 transition ' + (travelMode === 'WALKING' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100')}
            >
              <PersonStanding size={14} />
              {modeLabels.WALKING[locale]}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
