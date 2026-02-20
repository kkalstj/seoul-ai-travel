'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Sparkles, Heart, User } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BottomNav() {
  var pathname = usePathname();
  var { user } = useAuth();
  var { t } = useLanguage();

  var navItems = [
    { href: '/explore', icon: Search, label: t('nav.explore') },
    { href: '/ai-recommend', icon: Sparkles, label: t('nav.ai') },
    { href: '/my-trip', icon: Heart, label: t('nav.myTrip') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-100 md:hidden">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map(function(item) {
          var isActive = pathname.startsWith(item.href);
          var Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={'flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors ' + (isActive ? 'text-blue-600' : 'text-gray-400')}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        <Link
          href={user ? '/profile' : '/auth'}
          className={'flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors ' + (pathname.startsWith('/profile') || pathname.startsWith('/auth') ? 'text-blue-600' : 'text-gray-400')}
        >
          <User className="w-5 h-5" />
          <span className="text-xs font-medium">{user ? t('nav.profile') : t('nav.login')}</span>
        </Link>
      </div>
    </nav>
  );
}
