'use client';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

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
        </nav>
      </div>
    </header>
  );
}
