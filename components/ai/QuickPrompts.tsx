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
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
}

export default function QuickPrompts({ onSelect }: QuickPromptsProps) {
  var { t } = useLanguage();

  var prompts = [
    {
      icon: UtensilsCrossed,
      label: t('quick.food'),
      prompt: t('quick.foodPrompt'),
      color: 'text-orange-500 bg-orange-50 border-orange-200',
    },
    {
      icon: Heart,
      label: t('quick.date'),
      prompt: t('quick.datePrompt'),
      color: 'text-pink-500 bg-pink-50 border-pink-200',
    },
    {
      icon: Landmark,
      label: t('quick.history'),
      prompt: t('quick.historyPrompt'),
      color: 'text-purple-500 bg-purple-50 border-purple-200',
    },
    {
      icon: Users,
      label: t('quick.family'),
      prompt: t('quick.familyPrompt'),
      color: 'text-blue-500 bg-blue-50 border-blue-200',
    },
    {
      icon: Footprints,
      label: t('quick.solo'),
      prompt: t('quick.soloPrompt'),
      color: 'text-green-500 bg-green-50 border-green-200',
    },
    {
      icon: Moon,
      label: t('quick.night'),
      prompt: t('quick.nightPrompt'),
      color: 'text-indigo-500 bg-indigo-50 border-indigo-200',
    },
    {
      icon: Camera,
      label: t('quick.insta'),
      prompt: t('quick.instaPrompt'),
      color: 'text-rose-500 bg-rose-50 border-rose-200',
    },
    {
      icon: ShoppingBag,
      label: t('quick.shopping'),
      prompt: t('quick.shoppingPrompt'),
      color: 'text-amber-500 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {prompts.map(function(item) {
        var Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={function() { onSelect(item.prompt); }}
            className={'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all hover:shadow-md hover:-translate-y-0.5 ' + item.color}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
