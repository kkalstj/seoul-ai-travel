'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { supabase } from '@/lib/supabase/client';

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

var typeEmoji: Record<string, string> = {
  restaurant: '🍽️',
  accommodation: '🏨',
  attraction: '🏛️',
};

export default function ItineraryMap({ itinerary }: ItineraryMapProps) {
  var { t } = useLanguage();
  var mapRef = useRef<HTMLDivElement>(null);
  var mapInstanceRef = useRef<L.Map | null>(null);
  var [loading, setLoading] = useState(true);

  useEffect(function() {
    if (!mapRef.current || mapInstanceRef.current) return;

    var map = L.map(mapRef.current, {
      center: [37.5665, 126.978],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    mapInstanceRef.current = map;

    var allPlaces: { name: string; type: string; order: number }[] = [];
    itinerary.days.forEach(function(day) {
      day.places.forEach(function(place, idx) {
        allPlaces.push({
          name: place.name.replace(/\s*\(.*?\)\s*/g, '').trim(),
          type: place.type || 'attraction',
          order: allPlaces.length + 1,
        });
      });
    });

    async function findAndPlotPlaces() {
      var coords: L.LatLng[] = [];

      for (var i = 0; i < allPlaces.length; i++) {
        var place = allPlaces[i];
        var searchName = place.name;

        var found = false;
        var tables = ['restaurants', 'accommodations', 'attractions'];
        
        for (var t = 0; t < tables.length; t++) {
          var { data } = await supabase
            .from(tables[t])
            .select('name, latitude, longitude')
            .ilike('name', '%' + searchName + '%')
            .limit(1);

          if (data && data.length > 0 && data[0].latitude && data[0].longitude) {
            var lat = data[0].latitude;
            var lng = data[0].longitude;
            var color = typeColors[place.type] || '#8B5CF6';
            var emoji = typeEmoji[place.type] || '📍';

            var icon = L.divIcon({
              className: 'custom-marker',
              html: '<div style="background:' + color + '; color:white; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3);">' + place.order + '</div>',
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });

            L.marker([lat, lng], { icon: icon })
              .addTo(map)
              .bindPopup('<b>' + emoji + ' ' + place.order + '. ' + place.name + '</b>');

            coords.push(L.latLng(lat, lng));
            found = true;
            break;
          }
        }

        if (!found) {
          try {
            var res = await fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(searchName + ' 서울') + '&limit=1');
            var results = await res.json();
            if (results && results.length > 0) {
              var lat2 = parseFloat(results[0].lat);
              var lng2 = parseFloat(results[0].lon);
              var color2 = typeColors[place.type] || '#8B5CF6';
              var emoji2 = typeEmoji[place.type] || '📍';

              var icon2 = L.divIcon({
                className: 'custom-marker',
                html: '<div style="background:' + color2 + '; color:white; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3);">' + place.order + '</div>',
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              });

              L.marker([lat2, lng2], { icon: icon2 })
                .addTo(map)
                .bindPopup('<b>' + emoji2 + ' ' + place.order + '. ' + place.name + '</b>');

              coords.push(L.latLng(lat2, lng2));
            }
          } catch (err) {
            console.error('Geocoding error:', err);
          }
        }
      }

      if (coords.length > 1) {
        L.polyline(coords, {
          color: '#3B82F6',
          weight: 3,
          opacity: 0.7,
          dashArray: '8, 8',
        }).addTo(map);

        var bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [30, 30] });
      } else if (coords.length === 1) {
        map.setView(coords[0], 15);
      }

      setLoading(false);
    }

    findAndPlotPlaces();

    return function() {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [itinerary]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="relative">
        <div ref={mapRef} style={{ height: '280px', width: '100%' }} />
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              {t('ai.mapLoading')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
