'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ResetPasswordPage() {
  var router = useRouter();
  var { locale } = useLanguage();
  var [newPassword, setNewPassword] = useState('');
  var [confirmPassword, setConfirmPassword] = useState('');
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState('');
  var [success, setSuccess] = useState(false);
  var [sessionReady, setSessionReady] = useState(false);
  var [sessionError, setSessionError] = useState(false);

  var labels: Record<string, Record<string, string>> = {
    title: { ko: '새 비밀번호 설정', en: 'Set New Password', ja: '新しいパスワードを設定', zh: '设置新密码' },
    hint: { ko: '새로운 비밀번호를 입력해주세요', en: 'Enter your new password', ja: '新しいパスワードを入力してください', zh: '请输入新密码' },
    newPassword: { ko: '새 비밀번호 (6자 이상)', en: 'New password (6+ chars)', ja: '新しいパスワード（6文字以上）', zh: '新密码（6位以上）' },
    confirmPassword: { ko: '비밀번호 확인', en: 'Confirm password', ja: 'パスワード確認', zh: '确认密码' },
    save: { ko: '비밀번호 변경', en: 'Change Password', ja: 'パスワード変更', zh: '修改密码' },
    processing: { ko: '변경 중...', en: 'Changing...', ja: '変更中...', zh: '修改中...' },
    success: { ko: '비밀번호가 변경되었습니다! 잠시 후 로그인 페이지로 이동합니다.', en: 'Password changed! Redirecting to login...', ja: 'パスワードが変更されました！ログインページに移動します。', zh: '密码已更改！即将跳转到登录页面。' },
    mismatch: { ko: '비밀번호가 일치하지 않습니다', en: 'Passwords do not match', ja: 'パスワードが一致しません', zh: '密码不匹配' },
    tooShort: { ko: '비밀번호는 6자 이상이어야 합니다', en: 'Password must be at least 6 characters', ja: 'パスワードは6文字以上必要です', zh: '密码至少6个字符' },
    invalidLink: { ko: '유효하지 않거나 만료된 링크입니다. 다시 비밀번호 재설정을 요청해주세요.', en: 'Invalid or expired link. Please request a new password reset.', ja: '無効または期限切れのリンクです。パスワードリセットを再度リクエストしてください。', zh: '链接无效或已过期。请重新申请密码重置。' },
    backToLogin: { ko: '로그인으로 돌아가기', en: 'Back to login', ja: 'ログインに戻る', zh: '返回登录' },
  };

  useEffect(function() {
    // Supabase가 URL의 토큰을 자동으로 처리하고 세션을 설정함
    var { data: { subscription } } = supabase.auth.onAuthStateChange(function(event) {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // 이미 세션이 있는 경우 (페이지 새로고침 등)
    supabase.auth.getSession().then(function({ data }) {
      if (data.session) {
        setSessionReady(true);
      } else {
        // 잠시 대기 후에도 세션이 없으면 에러
        setTimeout(function() {
          supabase.auth.getSession().then(function({ data: retryData }) {
            if (retryData.session) {
              setSessionReady(true);
            } else {
              setSessionError(true);
            }
          });
        }, 2000);
      }
    });

    return function() {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError(labels.tooShort[locale]);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(labels.mismatch[locale]);
      return;
    }

    setLoading(true);
    try {
      var { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      // 로그아웃 후 로그인 페이지로 이동
      setTimeout(async function() {
        await supabase.auth.signOut();
        router.push('/auth');
      }, 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 링크 유효하지 않음
  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{labels.invalidLink[locale]}</h1>
          <button
            onClick={function() { router.push('/auth'); }}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            {labels.backToLogin[locale]}
          </button>
        </div>
      </div>
    );
  }

  // 세션 로딩 중
  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // 변경 성공
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-700">{labels.success[locale]}</p>
        </div>
      </div>
    );
  }

  // 비밀번호 입력 폼
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{labels.title[locale]}</h1>
          <p className="text-gray-500 text-sm mt-1">{labels.hint[locale]}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={newPassword}
                onChange={function(e) { setNewPassword(e.target.value); }}
                placeholder={labels.newPassword[locale]}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={function(e) { setConfirmPassword(e.target.value); }}
                onKeyDown={function(e) { if (e.key === 'Enter') handleSubmit(e); }}
                placeholder={labels.confirmPassword[locale]}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? labels.processing[locale] : labels.save[locale]}
          </button>
        </form>
      </div>
    </div>
  );
}
