'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  var { locale } = useLanguage();
  var router = useRouter();

  var content: Record<string, { title: string; updated: string; sections: { heading: string; body: string }[] }> = {
    ko: {
      title: '개인정보처리방침',
      updated: '2025년 3월 8일 시행',
      sections: [
        {
          heading: '1. 개인정보의 수집 및 이용 목적',
          body: 'Seoul AI Travel(이하 "서비스")은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않습니다.\n\n① 회원가입 및 관리: 회원 식별, 서비스 제공, 계정 관리\n② 서비스 제공: 여행 코스 저장, 찜하기, 리뷰 작성 등 맞춤형 서비스 제공\n③ 서비스 개선: 서비스 이용 통계 분석 및 품질 향상',
        },
        {
          heading: '2. 수집하는 개인정보 항목',
          body: '서비스는 다음의 개인정보 항목을 수집합니다.\n\n① 필수항목: 이메일 주소, 비밀번호(암호화 저장)\n② 선택항목: 닉네임, 프로필 사진\n③ 자동수집항목: 서비스 이용 기록, 접속 로그, 쿠키',
        },
        {
          heading: '3. 개인정보의 보유 및 이용 기간',
          body: '① 회원 탈퇴 시까지 보유하며, 탈퇴 즉시 파기합니다.\n② 관계 법령에 의한 보존 의무가 있는 경우, 해당 기간 동안 보존합니다.',
        },
        {
          heading: '4. 개인정보의 제3자 제공',
          body: '서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.\n\n① 이용자가 사전에 동의한 경우\n② 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우',
        },
        {
          heading: '5. 개인정보 처리 위탁',
          body: '서비스는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.\n\n① Supabase (데이터베이스 및 인증 서비스): 회원정보 저장 및 인증 처리\n② Vercel (웹 호스팅): 웹사이트 호스팅 및 서비스 제공\n③ Google (지도 및 AI 서비스): 지도 표시 및 AI 추천 기능 제공',
        },
        {
          heading: '6. 쿠키의 사용',
          body: '① 서비스는 이용자에게 맞춤형 서비스를 제공하기 위해 쿠키를 사용합니다.\n② 쿠키는 웹사이트 운영에 이용되는 서버가 이용자의 브라우저에 보내는 소량의 정보로, 이용자의 PC 또는 모바일에 저장됩니다.\n③ 이용자는 웹 브라우저 설정을 통해 쿠키를 허용하거나 거부할 수 있습니다.\n\n쿠키 설정 방법:\n- Chrome: 설정 > 개인정보 보호 및 보안 > 인터넷 사용 기록 삭제\n- Edge: 설정 > 쿠키 및 사이트 권한 > 쿠키 및 사이트 데이터 관리\n- Safari: 설정 > Safari > 고급 > 모든 쿠키 차단',
        },
        {
          heading: '7. 개인정보의 안전성 확보 조치',
          body: '서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.\n\n① 비밀번호 암호화: 회원의 비밀번호는 암호화되어 저장·관리됩니다.\n② 해킹 등에 대비한 기술적 대책: SSL/TLS 암호화 통신을 적용합니다.\n③ 접근 제한: 개인정보에 대한 접근 권한을 최소한의 인원으로 제한합니다.',
        },
        {
          heading: '8. 정보주체의 권리·의무 및 행사방법',
          body: '이용자(정보주체)는 다음과 같은 권리를 행사할 수 있습니다.\n\n① 개인정보 열람 요구\n② 오류 등이 있을 경우 정정 요구\n③ 삭제 요구\n④ 처리정지 요구\n\n위 권리 행사는 서비스의 프로필 페이지를 통해 직접 처리하거나, 아래 연락처를 통해 요청하실 수 있습니다.',
        },
        {
          heading: '9. 개인정보 보호책임자',
          body: '서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.\n\n개인정보 보호책임자\n- 이메일: 서비스 운영자 이메일',
        },
        {
          heading: '10. 권익침해 구제방법',
          body: '이용자는 개인정보침해로 인한 구제를 받기 위하여 다음 기관에 분쟁해결이나 상담 등을 신청할 수 있습니다.\n\n① 개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)\n② 개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)\n③ 대검찰청: (국번없이) 1301 (www.spo.go.kr)\n④ 경찰청: (국번없이) 182 (ecrm.cyber.go.kr)',
        },
        {
          heading: '11. 개인정보 처리방침 변경',
          body: '이 개인정보 처리방침은 2025년 3월 8일부터 적용됩니다. 변경사항이 있을 경우 서비스 공지사항을 통해 고지합니다.',
        },
      ],
    },
    en: {
      title: 'Privacy Policy',
      updated: 'Effective March 8, 2025',
      sections: [
        {
          heading: '1. Purpose of Collecting Personal Information',
          body: 'Seoul AI Travel ("Service") processes personal information for the following purposes:\n\n① Membership management: User identification, service provision, account management\n② Service provision: Personalized services including trip saving, favorites, and reviews\n③ Service improvement: Usage statistics analysis and quality enhancement',
        },
        {
          heading: '2. Personal Information Collected',
          body: '① Required: Email address, password (stored encrypted)\n② Optional: Nickname, profile photo\n③ Automatically collected: Service usage records, access logs, cookies',
        },
        {
          heading: '3. Retention Period',
          body: '① Personal information is retained until membership withdrawal and destroyed immediately upon withdrawal.\n② If retention is required by law, information is preserved for the legally mandated period.',
        },
        {
          heading: '4. Third-Party Services',
          body: 'The Service uses the following third-party services for operation:\n\n① Supabase: Database and authentication services\n② Vercel: Web hosting\n③ Google: Maps and AI recommendation services',
        },
        {
          heading: '5. Cookies',
          body: '① The Service uses cookies to provide personalized experiences.\n② Users can allow or block cookies through browser settings.\n\nCookie settings:\n- Chrome: Settings > Privacy and Security > Clear browsing data\n- Edge: Settings > Cookies and site permissions\n- Safari: Settings > Safari > Advanced > Block All Cookies',
        },
        {
          heading: '6. User Rights',
          body: 'Users may exercise the following rights:\n\n① Request to view personal information\n② Request correction of errors\n③ Request deletion\n④ Request to stop processing\n\nThese rights can be exercised through the profile page or by contacting us.',
        },
        {
          heading: '7. Changes to Privacy Policy',
          body: 'This Privacy Policy is effective from March 8, 2025. Changes will be announced through the Service.',
        },
      ],
    },
    ja: {
      title: '個人情報処理方針',
      updated: '2025年3月8日施行',
      sections: [
        {
          heading: '1. 個人情報の収集及び利用目的',
          body: 'Seoul AI Travel（以下「サービス」）は以下の目的で個人情報を処理します。\n\n① 会員管理：会員識別、サービス提供、アカウント管理\n② サービス提供：旅行コース保存、お気に入り、レビューなどのカスタマイズサービス\n③ サービス改善：利用統計分析及び品質向上',
        },
        {
          heading: '2. 収集する個人情報項目',
          body: '① 必須項目：メールアドレス、パスワード（暗号化保存）\n② 選択項目：ニックネーム、プロフィール写真\n③ 自動収集項目：サービス利用記録、接続ログ、クッキー',
        },
        {
          heading: '3. 第三者サービス',
          body: 'サービスは以下の第三者サービスを利用しています。\n\n① Supabase：データベース及び認証サービス\n② Vercel：ウェブホスティング\n③ Google：地図及びAI推薦サービス',
        },
        {
          heading: '4. 変更',
          body: 'この個人情報処理方針は2025年3月8日から適用されます。',
        },
      ],
    },
    zh: {
      title: '隐私政策',
      updated: '2025年3月8日生效',
      sections: [
        {
          heading: '1. 收集个人信息的目的',
          body: 'Seoul AI Travel（以下简称"服务"）为以下目的处理个人信息：\n\n① 会员管理：用户识别、服务提供、账户管理\n② 服务提供：旅行路线保存、收藏、评价等个性化服务\n③ 服务改进：使用统计分析及质量提升',
        },
        {
          heading: '2. 收集的个人信息项目',
          body: '① 必填项：电子邮箱、密码（加密存储）\n② 选填项：昵称、头像\n③ 自动收集项：服务使用记录、访问日志、Cookie',
        },
        {
          heading: '3. 第三方服务',
          body: '服务使用以下第三方服务：\n\n① Supabase：数据库及认证服务\n② Vercel：网站托管\n③ Google：地图及AI推荐服务',
        },
        {
          heading: '4. 变更',
          body: '本隐私政策自2025年3月8日起生效。',
        },
      ],
    },
  };

  var c = content[locale] || content['ko'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={function() { router.back(); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} />
        {locale === 'ko' ? '뒤로' : 'Back'}
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">{c.title}</h1>
      <p className="text-sm text-gray-400 mb-8">{c.updated}</p>

      <div className="space-y-6">
        {c.sections.map(function(section, i) {
          return (
            <div key={i}>
              <h2 className="font-bold text-gray-900 mb-2">{section.heading}</h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {section.body}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
