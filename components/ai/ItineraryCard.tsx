'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  UtensilsCrossed,
  Hotel,
  Landmark,
  Lightbulb,
  Calendar,
  Save,
  Check,
  LucideIcon
} from 'lucide-react';
import { saveAICourse } from '@/lib/supabase/courses';

// 사용하는 i18n 라이브러리에 맞게 import 해주세요.
// 예: import { useTranslations } from 'next-intl';
// 예: import { useTranslation } from 'react-i18next';

interface Place {
  name: string;
  type: string;
  time: string;
  duration: string;
  tip: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  category?: string;
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

interface ItineraryCardProps {
  itinerary: Itinerary;
}

const typeConfig: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  restaurant: { icon: UtensilsCrossed, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  accommodation: { icon: Hotel, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
  attraction: { icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
};

export default function ItineraryCard({ itinerary }: ItineraryCardProps) {
 

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (saving || saved) return;
    setSaving(true);

    try {
      const places = itinerary.days.flatMap(day => 
        day.places.map(place => ({
          place_type: place.type || 'attraction',
          place_name: place.name,
          place_address: place.address || null,
          place_latitude: place.latitude || null,
          place_longitude: place.longitude || null,
          place_rating: place.rating || null,
          place_category: place.category || null,
          day_number: day.day,
          memo: place.tip || null,
        }))
      );

      await saveAICourse(itinerary.title || 'AI 추천 코스', places);
      setSaved(true);
    } catch (err) {
      console.error('코스 저장 실패:', err);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 relative">
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition whitespace-nowrap ${
            saved ? 'bg-green-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {saved ? (
            <>
              <Check size={12} />
              {t('ai.saved')}
            </>
          ) : saving ? (
            <>
              <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              {t('ai.saving')}
            </>
          ) : (
            <>
              <Save size={12} />
              {t('ai.saveCourse')}
            </>
          )}
        </button>
        <div className="pr-20">
          <h3 className="text-white font-bold text-lg">{itinerary.title}</h3>
          <p className="text-blue-100 text-sm mt-1">{itinerary.description}</p>
        </div>
      </div>

      {saved && (
        <div className="bg-green-50 px-5 py-2 flex items-center justify-between">
          <span className="text-green-700 text-sm">내 여행에 저장되었습니다!</span>
          <button
            onClick={() => router.push('/my-trip')}
            className="text-green-600 text-sm font-medium hover:underline"
          >
            보러가기
          </button>
        </div>
      )}

      <div className="p-4 space-y-4">
        {itinerary.days.map((day) => (
          <div key={day.day}>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">
                  Day {day.day}
                </span>
              </div>
              <span className="text-sm text-gray-500">{day.theme}</span>
            </div>

            <div className="space-y-0">
              {day.places.map((place, idx) => {
                const config = typeConfig[place.type] || typeConfig.attraction;
                const Icon = config.icon;

                return (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full border-2 ${config.bg} flex items-center justify-center`}>
                        <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                      </div>
                      {idx < day.places.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-1" />
                      )}
                    </div>

                    <div className="pb-4 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">
                          {place.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {place.time}
                        </span>
                        <span>{place.duration}</span>
                      </div>
                      {place.tip && (
                        <div className="flex items-start gap-1.5 mt-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg">
                          <Lightbulb className="w-3 h-3 mt-0.5 shrink-0" />
                          <span>{place.tip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
