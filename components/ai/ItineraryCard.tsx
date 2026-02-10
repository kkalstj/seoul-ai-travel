'use client';

import {
  Clock,
  UtensilsCrossed,
  Hotel,
  Landmark,
  Lightbulb,
  Calendar,
} from 'lucide-react';

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

interface ItineraryCardProps {
  itinerary: Itinerary;
}

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  restaurant: { icon: UtensilsCrossed, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  accommodation: { icon: Hotel, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
  attraction: { icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
};

export default function ItineraryCard({ itinerary }: ItineraryCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4">
        <h3 className="text-white font-bold text-lg">{itinerary.title}</h3>
        <p className="text-blue-100 text-sm mt-1">{itinerary.description}</p>
      </div>

      {/* 일정 */}
      <div className="p-4 space-y-4">
        {itinerary.days.map((day) => (
          <div key={day.day}>
            {/* Day 헤더 */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">
                  Day {day.day}
                </span>
              </div>
              <span className="text-sm text-gray-500">{day.theme}</span>
            </div>

            {/* 장소 타임라인 */}
            <div className="space-y-0">
              {day.places.map((place, idx) => {
                const config = typeConfig[place.type] || typeConfig.attraction;
                const Icon = config.icon;

                return (
                  <div key={idx} className="flex gap-3">
                    {/* 타임라인 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full border-2 ${config.bg} flex items-center justify-center`}>
                        <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                      </div>
                      {idx < day.places.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-1" />
                      )}
                    </div>

                    {/* 장소 정보 */}
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