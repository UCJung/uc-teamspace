import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{title}</h1>
      <p style={{ color: 'var(--text-sub)', marginTop: 8 }}>준비 중입니다.</p>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Placeholder title="대시보드" />} />
          <Route path="/login" element={<Placeholder title="로그인" />} />
          <Route path="/my-weekly" element={<Placeholder title="내 주간업무 작성" />} />
          <Route path="/my-history" element={<Placeholder title="내 업무 이력" />} />
          <Route path="/part-status" element={<Placeholder title="파트 업무 현황" />} />
          <Route path="/part-summary" element={<Placeholder title="파트 취합보고" />} />
          <Route path="/team-status" element={<Placeholder title="팀 업무 현황" />} />
          <Route path="/team-mgmt" element={<Placeholder title="팀 관리" />} />
          <Route path="/project-mgmt" element={<Placeholder title="프로젝트 관리" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
