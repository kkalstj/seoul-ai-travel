'use client';

import { User, Bot } from 'lucide-react';
import ItineraryCard from './ItineraryCard';
import ItineraryMap from './ItineraryMap';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

function extractItinerary(content: string) {
  var jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch) return null;

  try {
    var parsed = JSON.parse(jsonMatch[1]);
    return parsed.itinerary || null;
  } catch {
    return null;
  }
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  var isUser = role === 'user';
  var itinerary = !isUser ? extractItinerary(content) : null;

  if (isUser) {
    return (
      <div className="flex gap-3 flex-row-reverse">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-blue-600">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="max-w-[80%]">
          <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed bg-blue-600 text-white rounded-tr-sm">
            {content}
          </div>
        </div>
      </div>
    );
  }

  if (itinerary) {
    return (
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="max-w-[90%] space-y-3">
          <ItineraryMap itinerary={itinerary} />
          <ItineraryCard itinerary={itinerary} />
        </div>
      </div>
    );
  }

  var textContent = content;
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="max-w-[80%]">
        <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm">
          {textContent.split('\n').map(function(line, i) {
            return (
              <span key={i}>
                {line}
                {i < textContent.split('\n').length - 1 && <br />}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
