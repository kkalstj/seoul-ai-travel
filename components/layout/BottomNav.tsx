'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Sparkles, Heart, Map } from 'lucide-react';

const navItems = [
  { href: '/explore', icon: Search, label: '탐색' },
  { href: '/ai-recommend', icon: Sparkles, label: 'AI 추천' },
  { href: '/my-trip', icon: Heart, label: '내 여행' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-100 md:hidden">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}