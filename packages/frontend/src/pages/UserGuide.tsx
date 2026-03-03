import React, { useState } from 'react';
import { BookOpen, Users, UserCheck, Crown, Shield } from 'lucide-react';

/* ───────── 탭 정의 ───────── */
const TABS = [
  { key: 'start', label: '시작하기', icon: BookOpen },
  { key: 'member', label: '팀원 가이드', icon: Users },
  { key: 'part-leader', label: '파트장 가이드', icon: UserCheck },
  { key: 'leader', label: '팀장 가이드', icon: Crown },
  { key: 'admin', label: 'Admin 가이드', icon: Shield },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/* ───────── 헬퍼 컴포넌트 ───────── */

function Screenshot({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="my-4 rounded-lg overflow-hidden border"
      style={{ borderColor: 'var(--gray-border)' }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-auto"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h3
        className="text-[15px] font-bold mb-3 pb-2 border-b"
        style={{ color: 'var(--text)', borderColor: 'var(--gray-border)' }}
      >
        {title}
      </h3>
      <div className="text-[13px] leading-relaxed" style={{ color: 'var(--text)' }}>
        {children}
      </div>
    </section>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-start gap-2 p-3 rounded-lg my-3 text-[13px]"
      style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--primary-dark)' }}
    >
      <span className="font-bold flex-shrink-0">TIP</span>
      <span>{children}</span>
    </div>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="list-none space-y-2 my-3">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-2">
          <span
            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white mt-0.5"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {i + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function FormatExample() {
  return (
    <div
      className="rounded-lg p-4 my-3 text-[13px] font-mono"
      style={{ backgroundColor: 'var(--tbl-header)', border: '1px solid var(--gray-border)' }}
    >
      <div className="font-bold" style={{ color: 'var(--primary)' }}>
        [프로젝트 관리 시스템 개발]
      </div>
      <div className="ml-4">
        <span style={{ color: 'var(--text)' }}>• DB 스키마 설계 완료</span>
      </div>
      <div className="ml-8" style={{ color: 'var(--text-sub)' }}>
        ㄴ ERD 작성 및 리뷰 반영
      </div>
      <div className="ml-8" style={{ color: 'var(--text-sub)' }}>
        ㄴ 마이그레이션 스크립트 작성
      </div>
      <div className="ml-4">
        <span style={{ color: 'var(--text)' }}>• API 엔드포인트 구현 (80%)</span>
      </div>

      <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--gray-border)' }}>
        <div className="text-[12px]" style={{ color: 'var(--text-sub)' }}>
          입력 방법:
        </div>
        <div className="mt-1 space-y-1">
          <div>
            <code
              className="px-1 rounded text-[12px]"
              style={{ backgroundColor: 'var(--primary-bg)' }}
            >
              [텍스트]
            </code>{' '}
            → 업무항목 (1단계, 볼드+보라색)
          </div>
          <div>
            <code
              className="px-1 rounded text-[12px]"
              style={{ backgroundColor: 'var(--primary-bg)' }}
            >
              *텍스트
            </code>{' '}
            → 세부업무 (2단계, 불릿 변환)
          </div>
          <div>
            <code
              className="px-1 rounded text-[12px]"
              style={{ backgroundColor: 'var(--primary-bg)' }}
            >
              ㄴ텍스트
            </code>{' '}
            → 상세작업 (3단계, 들여쓰기)
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── 탭 콘텐츠 ───────── */

function StartGuide() {
  return (
    <>
      <Section title="로그인">
        <p>시스템에 접속하면 로그인 화면이 표시됩니다. 발급받은 이메일과 비밀번호를 입력하세요.</p>
        <Screenshot src="/guide/screenshots/common-login.png" alt="로그인 화면" />
        <Tip>초기 비밀번호로 로그인하면 비밀번호 변경이 필요합니다.</Tip>
      </Section>

      <Section title="계정 신청">
        <p>
          계정이 없는 경우 로그인 화면 하단의 &quot;계정 신청&quot; 링크를 클릭하여 가입을
          신청할 수 있습니다.
        </p>
        <Screenshot src="/guide/screenshots/common-register.png" alt="계정 신청 화면" />
        <StepList
          steps={[
            '이름, 이메일, 비밀번호를 입력합니다.',
            '관리자가 계정을 승인할 때까지 대기합니다.',
            '승인 후 로그인이 가능합니다.',
          ]}
        />
      </Section>

      <Section title="팀 선택 / 가입 신청">
        <p>
          로그인 후 소속된 팀이 없거나 여러 팀에 소속된 경우, 팀 선택 화면에서 작업할 팀을
          선택합니다.
        </p>
        <Screenshot src="/guide/screenshots/member-teams.png" alt="팀 선택 화면" />
        <StepList
          steps={[
            '소속 팀 목록에서 작업할 팀을 선택합니다.',
            '새로운 팀에 가입하려면 "팀 가입 신청" 버튼을 클릭합니다.',
            '팀장이 가입 신청을 승인하면 해당 팀에서 활동할 수 있습니다.',
          ]}
        />
      </Section>

      <Section title="비밀번호 변경">
        <p>
          초기 비밀번호 또는 관리자가 초기화한 비밀번호로 로그인하면 비밀번호 변경 화면이
          자동으로 표시됩니다. 새 비밀번호를 입력하여 변경을 완료하세요.
        </p>
      </Section>
    </>
  );
}

function MemberGuide() {
  return (
    <>
      <Section title="대시보드">
        <p>
          로그인 후 가장 먼저 보이는 화면입니다. 이번 주 팀원들의 업무 작성 현황을 한눈에
          확인할 수 있습니다.
        </p>
        <Screenshot src="/guide/screenshots/member-dashboard.png" alt="대시보드" />
      </Section>

      <Section title="주간업무 작성">
        <p>좌측 메뉴에서 &quot;내 주간업무&quot;를 클릭하면 업무 작성 그리드가 표시됩니다.</p>
        <Screenshot src="/guide/screenshots/member-weekly-empty.png" alt="주간업무 작성 화면" />

        <h4
          className="text-[14px] font-semibold mt-4 mb-2"
          style={{ color: 'var(--text)' }}
        >
          그리드 편집 방법
        </h4>
        <StepList
          steps={[
            '프로젝트 열에서 해당 업무의 프로젝트를 선택합니다.',
            '"진행업무(한일)" 셀을 클릭하여 이번 주 수행한 업무를 입력합니다.',
            '"예정업무(할일)" 셀에 다음 주 계획을 입력합니다.',
            '"비고" 셀에 특이사항이 있으면 기재합니다.',
            '입력 내용은 자동 저장됩니다 (500ms 후).',
          ]}
        />

        <h4
          className="text-[14px] font-semibold mt-4 mb-2"
          style={{ color: 'var(--text)' }}
        >
          업무 서식 규칙
        </h4>
        <p>진행업무와 예정업무는 아래 서식을 사용하여 구조화할 수 있습니다.</p>
        <FormatExample />

        <h4
          className="text-[14px] font-semibold mt-4 mb-2"
          style={{ color: 'var(--text)' }}
        >
          전주 불러오기
        </h4>
        <p>
          지난 주 &quot;할일&quot;을 이번 주 &quot;한일&quot;로 자동 복사할 수 있습니다.
          상단의 &quot;전주 항목 불러오기&quot; 버튼을 클릭하세요.
        </p>
        <Screenshot src="/guide/screenshots/member-carry-forward-modal.png" alt="전주 불러오기 팝업" />
        <StepList
          steps={[
            '전주 항목 불러오기 버튼을 클릭합니다.',
            '팝업에서 가져올 항목을 체크합니다.',
            '"불러오기" 버튼을 클릭하면 선택한 할일이 이번 주 한일로 복사됩니다.',
          ]}
        />

        <h4
          className="text-[14px] font-semibold mt-4 mb-2"
          style={{ color: 'var(--text)' }}
        >
          프로젝트 선택
        </h4>
        <p>
          업무 행을 추가할 때 프로젝트를 선택하는 팝업이 표시됩니다.
        </p>
        <Screenshot src="/guide/screenshots/member-project-select-modal.png" alt="프로젝트 선택 팝업" />

        <h4
          className="text-[14px] font-semibold mt-4 mb-2"
          style={{ color: 'var(--text)' }}
        >
          제출
        </h4>
        <p>
          모든 업무 입력이 완료되면 &quot;제출&quot; 버튼을 클릭합니다. 제출 확인 팝업에서
          &quot;확인&quot;을 누르면 제출이 완료됩니다. 제출 후에도 수정은 가능하지만,
          파트장에게 이미 취합된 내용은 자동으로 반영되지 않습니다.
        </p>
        <Tip>행 추가는 하단의 &quot;+ 행 추가&quot; 버튼, 삭제는 행 우측의 삭제 버튼을 사용합니다.</Tip>
      </Section>
    </>
  );
}

function PartLeaderGuide() {
  return (
    <>
      <Section title="업무 현황 조회">
        <p>
          좌측 메뉴 &quot;업무현황&quot;에서 소속 파트원들의 주간업무 작성 현황을 확인할 수
          있습니다. 제출 상태, 작성 건수를 한눈에 볼 수 있습니다.
        </p>
        <Screenshot
          src="/guide/screenshots/part-leader-part-status.png"
          alt="파트 업무현황"
        />
      </Section>

      <Section title="보고서 취합">
        <p>
          &quot;보고서 취합&quot; 메뉴에서 파트원들의 업무를 취합하여 보고서를 작성합니다.
        </p>
        <Screenshot
          src="/guide/screenshots/part-leader-report-consolidation.png"
          alt="보고서 취합"
        />
        <StepList
          steps={[
            '"업무 불러오기" 버튼을 클릭하면 확인 팝업이 표시됩니다.',
            '확인 후 파트원들의 업무가 자동으로 로드됩니다.',
            '"병합" 버튼으로 프로젝트별로 업무를 자동 병합합니다.',
            '필요시 병합된 내용을 직접 편집합니다.',
            '완료 후 "제출" 버튼을 클릭합니다.',
          ]}
        />

        <h4
          className="text-[14px] font-semibold mt-4 mb-2"
          style={{ color: 'var(--text)' }}
        >
          업무 불러오기 팝업
        </h4>
        <p>
          &quot;업무 불러오기&quot; 버튼 클릭 시 기존 항목을 덮어쓸지 확인하는 팝업이
          표시됩니다. 확인을 누르면 파트원들의 주간업무가 취합 보고서로 로드됩니다.
        </p>
        <Screenshot
          src="/guide/screenshots/part-leader-load-rows-modal.png"
          alt="업무 불러오기 확인 팝업"
        />
      </Section>

      <Section title="Excel 내보내기">
        <p>
          대시보드 또는 보고서 취합 화면에서 Excel 내보내기 버튼을 클릭하면 해당 주차의
          파트 업무를 Excel 파일로 다운로드할 수 있습니다.
        </p>
        <Tip>Excel 파일은 기존 엑셀 양식과 동일한 형태로 생성됩니다.</Tip>
      </Section>
    </>
  );
}

function LeaderGuide() {
  return (
    <>
      <Section title="팀·파트 관리">
        <p>
          좌측 메뉴 &quot;팀·파트 관리&quot;에서 팀의 파트 구성과 팀원 정보를 관리합니다.
        </p>
        <Screenshot src="/guide/screenshots/leader-team-mgmt.png" alt="팀·파트 관리" />
        <StepList
          steps={[
            '파트 추가/삭제 및 파트장 지정이 가능합니다.',
            '팀원 역할 변경, 파트 이동이 가능합니다.',
            '드래그 앤 드롭으로 팀원 순서를 변경할 수 있습니다.',
          ]}
        />

        <h4
          className="text-[14px] font-semibold mt-4 mb-2"
          style={{ color: 'var(--text)' }}
        >
          팀원 등록 팝업
        </h4>
        <p>
          &quot;팀원 등록&quot; 버튼을 클릭하면 새 팀원을 등록하는 팝업이 표시됩니다.
          이름, 이메일, 비밀번호, 소속 파트, 역할을 입력하여 등록합니다.
        </p>
        <Screenshot src="/guide/screenshots/leader-member-create-modal.png" alt="팀원 등록 팝업" />

        <h4
          className="text-[14px] font-semibold mt-4 mb-2"
          style={{ color: 'var(--text)' }}
        >
          가입 신청 처리
        </h4>
        <p>
          팀 가입 신청 목록에서 &quot;승인&quot; 버튼을 클릭하면 파트 지정 팝업이 표시됩니다.
          소속 파트를 선택하고 승인하면 팀원으로 추가됩니다.
          &quot;거절&quot; 버튼 클릭 시 거절 확인 팝업이 표시됩니다.
        </p>
      </Section>

      <Section title="프로젝트 관리">
        <p>
          &quot;프로젝트 관리&quot;에서 팀에서 사용할 프로젝트 목록을 관리합니다.
        </p>
        <Screenshot src="/guide/screenshots/leader-project-mgmt.png" alt="프로젝트 관리" />
        <StepList
          steps={[
            '"프로젝트 추가" 버튼으로 전역 프로젝트 풀에서 선택합니다.',
            '프로젝트 순서를 드래그 앤 드롭으로 변경할 수 있습니다.',
            '사용하지 않는 프로젝트는 삭제 아이콘으로 제거할 수 있습니다.',
          ]}
        />

        <h4
          className="text-[14px] font-semibold mt-4 mb-2"
          style={{ color: 'var(--text)' }}
        >
          프로젝트 추가 팝업
        </h4>
        <p>
          &quot;프로젝트 추가&quot; 버튼을 클릭하면 전역 프로젝트 목록에서 팀에 추가할
          프로젝트를 선택하는 팝업이 표시됩니다. 검색 후 체크박스로 선택하여 추가합니다.
        </p>
        <Screenshot src="/guide/screenshots/leader-project-add-modal.png" alt="프로젝트 추가 팝업" />

        <Tip>프로젝트 제거 시 확인 팝업이 표시됩니다. 제거해도 기존 업무 데이터는 유지됩니다.</Tip>
      </Section>

      <Section title="팀 전체 취합보고">
        <p>
          &quot;보고서 취합&quot; 메뉴에서 범위를 &quot;팀&quot;으로 선택하면 팀 전체의
          업무를 취합할 수 있습니다.
        </p>
        <Screenshot
          src="/guide/screenshots/leader-report-consolidation.png"
          alt="팀 취합보고"
        />
      </Section>

      <Section title="가입 신청 승인">
        <p>
          팀 가입 신청이 있으면 &quot;팀·파트 관리&quot; 화면에서 신청 목록을 확인하고
          승인 또는 거절할 수 있습니다.
        </p>
        <Tip>승인 시 해당 팀원은 자동으로 MEMBER 역할로 팀에 추가됩니다.</Tip>
      </Section>
    </>
  );
}

function AdminGuide() {
  return (
    <>
      <Section title="계정 관리">
        <p>
          Admin 메뉴 &quot;계정 관리&quot;에서 전체 시스템 사용자의 계정을 관리합니다.
        </p>
        <Screenshot src="/guide/screenshots/admin-accounts.png" alt="계정 관리" />
        <StepList
          steps={[
            '신규 가입 신청(PENDING)을 확인하고 승인합니다.',
            '계정 상태를 ACTIVE / INACTIVE로 변경할 수 있습니다.',
            '비밀번호 초기화 시 임시 비밀번호가 설정됩니다.',
          ]}
        />
      </Section>

      <Section title="팀 관리">
        <p>
          &quot;팀 관리&quot;에서 팀 생성 신청을 승인하고 팀 상태를 관리합니다.
        </p>
        <Screenshot src="/guide/screenshots/admin-teams.png" alt="팀 관리" />
        <StepList
          steps={[
            '팀 생성 신청(PENDING)을 확인하고 승인합니다.',
            '승인 시 신청자가 자동으로 팀장(LEADER)으로 설정됩니다.',
            '팀 상태를 ACTIVE / INACTIVE로 전환할 수 있습니다.',
          ]}
        />
      </Section>

      <Section title="프로젝트 관리">
        <p>
          &quot;프로젝트 관리&quot;에서 전역 프로젝트 풀을 관리합니다. 여기서 등록된
          프로젝트를 각 팀에서 선택하여 사용합니다.
        </p>
        <Screenshot src="/guide/screenshots/admin-projects.png" alt="프로젝트 관리" />
        <StepList
          steps={[
            '"프로젝트 생성" 버튼으로 새 프로젝트를 등록합니다.',
            '기존 프로젝트의 수정 아이콘을 클릭하여 이름, 상태를 수정합니다.',
            '상태 토글 아이콘으로 활성/비활성 전환이 가능합니다.',
          ]}
        />

        <h4
          className="text-[14px] font-semibold mt-4 mb-2"
          style={{ color: 'var(--text)' }}
        >
          프로젝트 생성/수정 팝업
        </h4>
        <p>
          &quot;프로젝트 생성&quot; 버튼 또는 수정 아이콘을 클릭하면 프로젝트 정보를
          입력하는 팝업이 표시됩니다. 프로젝트 코드, 이름, 카테고리(공통/수행)를 설정합니다.
        </p>
        <Screenshot src="/guide/screenshots/admin-project-create-modal.png" alt="프로젝트 생성 팝업" />
        <Tip>프로젝트 코드는 시스템 전체에서 고유해야 하며, 생성 후 변경할 수 없습니다.</Tip>
      </Section>
    </>
  );
}

const TAB_CONTENT: Record<TabKey, React.FC> = {
  start: StartGuide,
  member: MemberGuide,
  'part-leader': PartLeaderGuide,
  leader: LeaderGuide,
  admin: AdminGuide,
};

/* ───────── 메인 컴포넌트 ───────── */

export default function UserGuide() {
  const [activeTab, setActiveTab] = useState<TabKey>('start');
  const Content = TAB_CONTENT[activeTab];

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--gray-light)' }}>
      {/* 탭 네비게이션 */}
      <div
        className="flex items-center gap-1 px-6 pt-4 pb-0 flex-shrink-0"
        style={{ backgroundColor: 'var(--gray-light)' }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-[13px] font-medium transition-colors"
              style={{
                backgroundColor: isActive ? '#fff' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-sub)',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div
          className="max-w-3xl mx-auto bg-white rounded-xl p-8"
          style={{ border: '1px solid var(--gray-border)' }}
        >
          <Content />
        </div>
      </div>
    </div>
  );
}
