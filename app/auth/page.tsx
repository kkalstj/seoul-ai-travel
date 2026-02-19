'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { signIn, signUp } from '@/lib/supabase/auth';

export default function AuthPage() {
  var router = useRouter();
  var [isLogin, setIsLogin] = useState(true);
  var [email, setEmail] = useState('');
  var [password, setPassword] = useState('');
  var [nickname, setNickname] = useState('');
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState('');
  var [success, setSuccess] = useState('');

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
        setSuccess('회원가입 성공! 이메일 인증 후 로그인해주세요.');
        setIsLogin(true);
      }
    } catch (err: any) {
      if (err.message === 'Invalid login credentials') {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (err.message === 'User already registered') {
        setError('이미 가입된 이메일입니다.');
      } else {
        setError(err.message || '오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Seoul AI Travel</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isLogin ? '로그인하고 더 많은 기능을 이용하세요' : '회원가입하고 여행을 시작하세요'}
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
                placeholder="이메일"
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
                placeholder="비밀번호 (6자 이상)"
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
            {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={function() { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
            className="text-sm text-blue-600 hover:underline"
          >
            {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>

        <div className="text-center mt-3">
          <button
            onClick={function() { router.push('/'); }}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            둘러보기
          </button>
        </div>
      </div>
    </div>
  );
}
