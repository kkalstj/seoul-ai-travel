'use client';

import {
  UtensilsCrossed,
  Heart,
  Users,
  Footprints,
  Moon,
  Camera,
  Landmark,
  ShoppingBag,
} from 'lucide-react';

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
}

const prompts = [
  {
    icon: UtensilsCrossed,
    label: '맛집 투어',
    prompt: '서울 맛집 투어 1일 코스를 추천해주세요. 다양한 한국 음식을 맛볼 수 있게요!',
    color: 'text-orange-500 bg-orange-50 border-orange-200',
  },
  {
    icon: Heart,
    label: '데이트 코스',
    prompt: '커플 데이트 코스를 추천해주세요. 분위기 좋은 곳 위주로 부탁해요.',
    color: 'text-pink-500 bg-pink-50 border-pink-200',
  },
  {
    icon: Landmark,
    label: '역사 탐방',
    prompt: '서울 역사 탐방 코스를 추천해주세요. 궁궐과 전통 문화 위주로요.',
    color: 'text-purple-500 bg-purple-50 border-purple-200',
  },
  {
    icon: Users,
    label: '가족 여행',
    prompt: '가족 여행 코스를 추천해주세요. 아이들이 좋아할 만한 곳도 포함해주세요.',
    color: 'text-blue-500 bg-blue-50 border-blue-200',
  },
  {
    icon: Footprints,
    label: '혼자 여행',
    prompt: '혼자 서울 여행 1일 코스를 추천해주세요. 관광지와 맛집을 적절히 섞어주세요.',
    color: 'text-green-500 bg-green-50 border-green-200',
  },
  {
    icon: Moon,
    label: '야경 투어',
    prompt: '서울 야경 투어 코스를 추천해주세요. 저녁부터 밤까지 즐길 수 있게요.',
    color: 'text-indigo-500 bg-indigo-50 border-indigo-200',
  },
  {
    icon: Camera,
    label: '인스타 핫플',
    prompt: '인스타그램에 올리기 좋은 서울 핫플레이스 코스를 추천해주세요.',
    color: 'text-rose-500 bg-rose-50 border-rose-200',
  },
  {
    icon: ShoppingBag,
    label: '쇼핑 코스',
    prompt: '서울 쇼핑 코스를 추천해주세요. 명동, 강남, 홍대 등 쇼핑 명소 위주로요.',
    color: 'text-amber-500 bg-amber-50 border-amber-200',
  },
];

export default function QuickPrompts({ onSelect }: QuickPromptsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {prompts.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={() => onSelect(item.prompt)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all hover:shadow-md hover:-translate-y-0.5 ${item.color}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}