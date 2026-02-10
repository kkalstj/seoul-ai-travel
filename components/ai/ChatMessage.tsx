'use client';

import { User, Bot } from 'lucide-react';
import ItineraryCard from './ItineraryCard';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

// AI 응답에서 JSON 일정 데이터 추출
function extractItinerary(content: string) {
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[1]);
    return parsed.itinerary || null;
  } catch {
    return null;
  }
}

// JSON 코드블록을 제거한 텍스트
function removeJsonBlock(content: string) {
  return content.replace(/```json\s*[\s\S]*?\s*```/g, '').trim();
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';
  const itinerary = !isUser ? extractItinerary(content) : null;
  const textContent = !isUser ? removeJsonBlock(content) : content;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* 아바타 */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-500 to-pink-500'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* 메시지 */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
          }`}
        >
          {/* 텍스트 내용 (줄바꿈 유지) */}
          {textContent.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < textContent.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>

        {/* 일정 카드 (AI 응답에 JSON이 있을 때) */}
        {itinerary && (
          <div className="mt-3">
            <ItineraryCard itinerary={itinerary} />
          </div>
        )}
      </div>
    </div>
  );
}