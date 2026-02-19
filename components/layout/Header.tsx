'use client';
import { MapPin, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function Header() {
  var pathname = usePathname();
  var { user, loading } = useAuth();

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
            탐색
          </Link>
          <Link
            href="/ai-recommend"
            className={'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ' + (pathname.startsWith('/ai-recommend') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50')}
          >
            AI 추천
          </Link>
          <Link
            href="/my-trip"
            className={'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ' + (pathname.startsWith('/my-trip') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50')}
          >
            내 여행
          </Link>
          {!loading && (
            user ? (
              <Link
                href="/profile"
                className={'ml-2 p-2 rounded-full transition-colors ' + (pathname.startsWith('/profile') ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100')}
              >
                <User size={18} />
              </Link>
            ) : (
              <Link
                href="/auth"
                className="ml-2 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                로그인
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
