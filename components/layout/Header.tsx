'use client';
import { useState } from 'react';
import { MapPin, User, Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Locale } from '@/lib/i18n/translations';

var langOptions: { code: Locale; label: string }[] = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
];

export default function Header() {
  var pathname = usePathname();
  var { user, loading } = useAuth();
  var { locale, setLocale, t } = useLanguage();
  var [showLang, setShowLang] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">Seoul AI Travel</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/explore"
            className={'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ' + (pathname.startsWith('/explore') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50')}
          >
            {t('nav.explore')}
          </Link>
          <Link
            href="/ai-recommend"
            className={'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ' + (pathname.startsWith('/ai-recommend') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50')}
          >
            {t('nav.ai')}
          </Link>
          <Link
            href="/my-trip"
            className={'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ' + (pathname.startsWith('/my-trip') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50')}
          >
            {t('nav.myTrip')}
          </Link>

          {/* 언어 선택 */}
          <div className="relative ml-2">
            <button
              onClick={function() { setShowLang(!showLang); }}
              className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <Globe size={16} />
              <span className="text-xs">{langOptions.find(function(l) { return l.code === locale; })?.label}</span>
            </button>
            {showLang && (
              <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 min-w-[100px] z-50">
                {langOptions.map(function(lang) {
                  return (
                    <button
                      key={lang.code}
                      onClick={function() { setLocale(lang.code); setShowLang(false); }}
                      className={'w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ' + (locale === lang.code ? 'text-blue-600 font-medium' : 'text-gray-700')}
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {!loading && (
            user ? (
              <Link
                href="/profile"
                className={'ml-1 p-2 rounded-full transition-colors ' + (pathname.startsWith('/profile') ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100')}
              >
                <User size={18} />
              </Link>
            ) : (
              <Link
                href="/auth"
                className="ml-1 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('nav.login')}
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
