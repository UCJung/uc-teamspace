import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authApi.login(email, password);
      const { accessToken, refreshToken, user } = data.data;
      login(accessToken, refreshToken, user as Parameters<typeof login>[2]);
      navigate('/');
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gray-light)] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-md w-[360px] px-8 py-10">
        <h1 className="text-[18px] font-bold text-[var(--text)] mb-1 text-center">주간업무보고</h1>
        <p className="text-[12px] text-[var(--text-sub)] mb-6 text-center">선행연구개발팀</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-sub)] mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="w-full h-9 px-3 border border-[var(--gray-border)] rounded text-[13px] outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-sub)] mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
              className="w-full h-9 px-3 border border-[var(--gray-border)] rounded text-[13px] outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          {error && (
            <p className="text-[11px] text-[var(--danger)] bg-[var(--danger-bg)] px-3 py-2 rounded">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" disabled={loading} className="w-full justify-center mt-1">
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </div>
    </div>
  );
}
