'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Mail, Lock, ArrowLeft } from 'lucide-react';
import { signIn, signUp, resetPassword } from '@/lib/supabase/auth';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AuthPage() {
  var router = useRouter();
  var { t, locale } = useLanguage();
  var [isLogin, setIsLogin] = useState(true);
  var [isForgotPassword, setIsForgotPassword] = useState(false);
  var [email, setEmail] = useState('');
  var [password, setPassword] = useState('');
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState('');
  var [success, setSuccess] = useState('');

  var labels: Record<string, Record<string, string>> = {
    forgotPassword: { ko: '비밀번호를 잊으셨나요?', en: 'Forgot your password?', ja: 'パスワードをお忘れですか？', zh: '忘记密码？' },
    forgotTitle: { ko: '비밀번호 재설정', en: 'Reset Password', ja: 'パスワードリセット', zh: '重置密码' },
    forgotHint: { ko: '가입한 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다', en: 'Enter your email and we\'ll send you a reset link', ja: 'メールアドレスを入力するとリセットリンクを送信します', zh: '输入您的邮箱，我们将发送重置链接' },
    sendResetLink: { ko: '재설정 링크 보내기', en: 'Send Reset Link', ja: 'リセットリンクを送信', zh: '发送重置链接' },
    resetEmailSent: { ko: '재설정 링크가 이메일로 발송되었습니다. 메일함을 확인해주세요!', en: 'Reset link sent! Please check your email.', ja: 'リセットリンクを送信しました。メールをご確認ください！', zh: '重置链接已发送！请检查您的邮箱。' },
    backToLogin: { ko: '로그인으로 돌아가기', en: 'Back to login', ja: 'ログインに戻る', zh: '返回登录' },
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        await signIn(email, password);
        router.push('/profile');
      } else {
        await signUp(email, password);
        setSuccess(t('auth.signupSuccess'));
        setIsLogin(true);
      }
    } catch (err: any) {
      if (err.message === 'Invalid login credentials') {
        setError(t('auth.invalidCredentials'));
      } else if (err.message === 'User already registered') {
        setError(t('auth.alreadyRegistered'));
      } else {
        setError(err.message || t('ai.error'));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await resetPassword(email.trim());
      setSuccess(labels.resetEmailSent[locale]);
    } catch (err: any) {
      setError(err.message || labels.forgotTitle[locale]);
    } finally {
      setLoading(false);
    }
  }

  function goToForgotPassword() {
    setIsForgotPassword(true);
    setError('');
    setSuccess('');
    setPassword('');
  }

  function goBackToLogin() {
    setIsForgotPassword(false);
    setError('');
    setSuccess('');
  }

  // 비밀번호 재설정 화면
  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{labels.forgotTitle[locale]}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {labels.forgotHint[locale]}
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={function(e) { setEmail(e.target.value); }}
                  placeholder={t('auth.email')}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-xl">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 text-sm px-4 py-2 rounded-xl">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? t('auth.processing') : labels.sendResetLink[locale]}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={goBackToLogin}
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              <ArrowLeft size={14} />
              {labels.backToLogin[locale]}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 로그인 / 회원가입 화면
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Seoul AI Travel</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isLogin ? t('auth.loginHint') : t('auth.signupHint')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={function(e) { setEmail(e.target.value); }}
                placeholder={t('auth.email')}
                required
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={function(e) { setPassword(e.target.value); }}
                placeholder={t('auth.password')}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 비밀번호를 잊으셨나요? - 로그인 모드에서만 표시 */}
          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={goToForgotPassword}
                className="text-xs text-gray-400 hover:text-blue-600 transition"
              >
                {labels.forgotPassword[locale]}
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 text-sm px-4 py-2 rounded-xl">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? t('auth.processing') : isLogin ? t('auth.login') : t('auth.signup')}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={function() { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
            className="text-sm text-blue-600 hover:underline"
          >
            {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
          </button>
        </div>

        <div className="text-center mt-3">
          <button
            onClick={function() { router.push('/'); }}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            {t('auth.browse')}
          </button>
        </div>
      </div>
    </div>
  );
}
