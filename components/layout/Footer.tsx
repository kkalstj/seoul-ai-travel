'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Footer() {
  var { locale } = useLanguage();

  var labels: Record<string, Record<string, string>> = {
    terms: { ko: '이용약관', en: 'Terms', ja: '利用規約', zh: '使用条款' },
    privacy: { ko: '개인정보처리방침', en: 'Privacy', ja: '個人情報処理方針', zh: '隐私政策' },
    sources: { ko: '데이터 출처', en: 'Data Sources', ja: 'データ出典', zh: '数据来源' },
    copyright: { ko: '© 2025 Seoul AI Travel. All rights reserved.', en: '© 2025 Seoul AI Travel. All rights reserved.', ja: '© 2025 Seoul AI Travel. All rights reserved.', zh: '© 2025 Seoul AI Travel. All rights reserved.' },
    aiDisclaimer: { ko: 'AI가 생성한 콘텐츠는 참고용이며, 실제와 다를 수 있습니다.', en: 'AI-generated content is for reference only and may not be accurate.', ja: 'AI生成コンテンツは参考用であり、実際と異なる場合があります。', zh: 'AI生成内容仅供参考，可能与实际情况有所不同。' },
  };

  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-12 hidden md:block">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/terms" className="hover:text-gray-600 transition">{labels.terms[locale]}</Link>
            <span>|</span>
            <Link href="/privacy" className="hover:text-gray-600 transition">{labels.privacy[locale]}</Link>
            <span>|</span>
            <Link href="/sources" className="hover:text-gray-600 transition">{labels.sources[locale]}</Link>
          </div>
          <p className="text-xs text-gray-400">{labels.copyright[locale]}</p>
        </div>
        <p className="text-xs text-gray-300 text-center mt-2">{labels.aiDisclaimer[locale]}</p>
      </div>
    </footer>
  );
}
