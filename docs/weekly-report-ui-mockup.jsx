import { useState } from "react";

// ── CSS Variables & Style Guide Applied ──
const CSS = {
  primary: "#6b5ce7",
  primaryDark: "#5647cc",
  primaryBg: "#ede9ff",
  accent: "#f5a623",
  ok: "#27ae60",
  okBg: "#e8f8f0",
  warn: "#e67e22",
  warnBg: "#fff3e0",
  danger: "#e74c3c",
  dangerBg: "#fdecea",
  text: "#1c2333",
  textSub: "#6c7a89",
  grayBorder: "#e0e4ea",
  grayLight: "#f0f2f5",
  rowAlt: "#f8f9fb",
  tblHeader: "#f4f6fa",
  white: "#ffffff",
  sidebarBg: "#181d2e",
  sidebarDivider: "#2a3045",
  sidebarActive: "#252d48",
  sidebarText: "#8896b3",
  sidebarSubActive: "#a89ef5",
};

const font = "'Noto Sans KR', sans-serif";

// ── Badge Component ──
const Badge = ({ type, children }) => {
  const styles = {
    ok: { bg: CSS.okBg, color: CSS.ok },
    warn: { bg: CSS.warnBg, color: CSS.warn },
    danger: { bg: CSS.dangerBg, color: CSS.danger },
    blue: { bg: "#e0f0ff", color: "#1a6bb5" },
    purple: { bg: CSS.primaryBg, color: CSS.primary },
    gray: { bg: CSS.grayLight, color: CSS.textSub },
  };
  const s = styles[type] || styles.gray;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "currentColor",
        }}
      />
      {children}
    </span>
  );
};

// ── Button Component ──
const Btn = ({ variant = "outline", size = "md", children, style, ...props }) => {
  const base = {
    height: size === "sm" ? 26 : 30,
    padding: size === "sm" ? "0 8px" : "0 12px",
    borderRadius: 5,
    fontSize: size === "sm" ? 11 : 12.5,
    fontWeight: 500,
    fontFamily: font,
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    cursor: "pointer",
    whiteSpace: "nowrap",
    border: "1px solid transparent",
    transition: "all 0.15s",
  };
  const variants = {
    primary: { background: CSS.primary, color: "#fff", borderColor: CSS.primary },
    outline: { background: "#fff", color: CSS.text, borderColor: CSS.grayBorder },
    danger: { background: CSS.danger, color: "#fff", borderColor: CSS.danger },
    ghost: { background: "transparent", color: CSS.textSub, borderColor: "transparent" },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...props}>
      {children}
    </button>
  );
};

// ── Sidebar ──
const Sidebar = ({ activeMenu, onNavigate }) => {
  const menuGroups = [
    {
      title: "업무관리",
      items: [
        { id: "dashboard", icon: "📊", label: "대시보드" },
        { id: "my-weekly", icon: "✏️", label: "내 주간업무" },
        { id: "my-history", icon: "📋", label: "업무 이력" },
      ],
    },
    {
      title: "파트 관리",
      items: [
        { id: "part-status", icon: "👥", label: "파트 업무 현황" },
        { id: "part-summary", icon: "📑", label: "파트 취합보고서" },
      ],
    },
    {
      title: "팀 관리",
      items: [
        { id: "team-status", icon: "🏢", label: "팀 업무 현황" },
        { id: "team-summary", icon: "📄", label: "취합보고서 조회" },
      ],
    },
    {
      title: "설정",
      items: [
        { id: "team-mgmt", icon: "⚙️", label: "팀·파트 관리" },
        { id: "project-mgmt", icon: "📂", label: "프로젝트 관리" },
      ],
    },
  ];

  return (
    <div
      style={{
        width: 210,
        background: CSS.sidebarBg,
        height: "100vh",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        fontFamily: font,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 48,
          padding: "0 16px",
          borderBottom: `1px solid ${CSS.sidebarDivider}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>📋</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>주간업무보고</span>
      </div>

      {/* Menu Groups */}
      <div style={{ flex: 1, paddingTop: 6 }}>
        {menuGroups.map((g) => (
          <div key={g.title}>
            <div
              style={{
                padding: "10px 16px 4px",
                fontSize: 10,
                fontWeight: 600,
                color: "#4a5470",
                letterSpacing: 0.8,
                textTransform: "uppercase",
              }}
            >
              {g.title}
            </div>
            {g.items.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  padding: "7px 16px",
                  fontSize: 12.5,
                  color: activeMenu === item.id ? "#fff" : CSS.sidebarText,
                  background: activeMenu === item.id ? CSS.sidebarActive : "transparent",
                  borderLeft: `3px solid ${activeMenu === item.id ? CSS.primary : "transparent"}`,
                  fontWeight: activeMenu === item.id ? 500 : 400,
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 13, width: 18, textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* User */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: `1px solid ${CSS.sidebarDivider}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: CSS.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          정
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#fff" }}>정우철</div>
          <div style={{ fontSize: 10, color: CSS.sidebarText }}>DX 파트 · 팀장</div>
        </div>
      </div>
    </div>
  );
};

// ── Header ──
const Header = ({ title, subtitle }) => (
  <div
    style={{
      height: 48,
      background: "#fff",
      borderBottom: `1px solid ${CSS.grayBorder}`,
      padding: "0 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontFamily: font,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: CSS.text }}>{title}</span>
      {subtitle && <span style={{ fontSize: 12, color: CSS.textSub }}>{subtitle}</span>}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 12, color: CSS.textSub }}>2026.02.27 (금)</span>
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: CSS.ok,
          animation: "pulse 2s infinite",
        }}
      />
    </div>
  </div>
);

// ── Summary Card ──
const SumCard = ({ icon, iconBg, label, value, sub }) => (
  <div
    style={{
      background: "#fff",
      border: `1px solid ${CSS.grayBorder}`,
      borderRadius: 8,
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        background: iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 11, color: CSS.textSub }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: CSS.text }}>{value}</div>
      {sub && <div style={{ fontSize: 10.5, color: CSS.textSub }}>{sub}</div>}
    </div>
  </div>
);

// ── Screen: Dashboard ──
const DashboardScreen = () => {
  const members = [
    { name: "정우철", part: "DX", role: "팀장", status: "submitted", items: 6 },
    { name: "이성전", part: "DX", role: "팀원", status: "submitted", items: 3 },
    { name: "김영상", part: "DX", role: "팀원", status: "submitted", items: 5 },
    { name: "권현하", part: "DX", role: "팀원", status: "draft", items: 4 },
    { name: "문선홍", part: "AX", role: "파트장", status: "submitted", items: 5 },
    { name: "김지환", part: "AX", role: "팀원", status: "submitted", items: 6 },
    { name: "송하은", part: "AX", role: "팀원", status: "not_started", items: 0 },
    { name: "최혜주", part: "AX", role: "팀원", status: "submitted", items: 4 },
    { name: "정원희", part: "AX", role: "팀원", status: "draft", items: 1 },
  ];

  const partSummary = [
    { part: "DX", status: "submitted", leader: "정우철" },
    { part: "AX", status: "draft", leader: "문선홍" },
  ];

  const statusBadge = (s) => {
    if (s === "submitted") return <Badge type="ok">제출완료</Badge>;
    if (s === "draft") return <Badge type="warn">임시저장</Badge>;
    return <Badge type="gray">미작성</Badge>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <SumCard icon="👥" iconBg="#eef2ff" label="전체 팀원" value="9" sub="DX 4명 · AX 5명" />
        <SumCard icon="✅" iconBg={CSS.okBg} label="제출 완료" value="6" sub="전체 9명 중" />
        <SumCard icon="📝" iconBg={CSS.warnBg} label="임시저장" value="2" sub="권현하, 정원희" />
        <SumCard icon="⏳" iconBg={CSS.dangerBg} label="미작성" value="1" sub="송하은" />
      </div>

      {/* 작성 현황 테이블 */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${CSS.grayBorder}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "11px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${CSS.grayBorder}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: CSS.text }}>팀원 작성 현황</span>
            <span style={{ fontSize: 12, color: CSS.textSub }}>2026년 9주차 (2/23 ~ 2/27)</span>
          </div>
          <Btn variant="outline" size="sm">
            📥 Excel 내보내기
          </Btn>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font }}>
          <thead>
            <tr>
              {["파트", "성명", "역할", "업무항목 수", "작성 상태", "최종 수정"].map((h) => (
                <th
                  key={h}
                  style={{
                    background: CSS.tblHeader,
                    padding: "9px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: CSS.textSub,
                    textAlign: "left",
                    borderBottom: `1px solid ${CSS.grayBorder}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr
                key={m.name}
                style={{
                  background: m.status === "not_started" ? "#fff8f0" : i % 2 === 0 ? CSS.rowAlt : "#fff",
                }}
              >
                <td style={{ padding: "9px 12px", fontSize: 12.5, color: CSS.text, borderBottom: `1px solid ${CSS.grayLight}` }}>
                  <Badge type={m.part === "DX" ? "blue" : "purple"}>{m.part}</Badge>
                </td>
                <td style={{ padding: "9px 12px", fontSize: 12.5, fontWeight: 500, color: CSS.text, borderBottom: `1px solid ${CSS.grayLight}` }}>{m.name}</td>
                <td style={{ padding: "9px 12px", fontSize: 12.5, color: CSS.textSub, borderBottom: `1px solid ${CSS.grayLight}` }}>{m.role}</td>
                <td style={{ padding: "9px 12px", fontSize: 12.5, color: CSS.text, borderBottom: `1px solid ${CSS.grayLight}` }}>{m.items}건</td>
                <td style={{ padding: "9px 12px", borderBottom: `1px solid ${CSS.grayLight}` }}>{statusBadge(m.status)}</td>
                <td style={{ padding: "9px 12px", fontSize: 12, color: CSS.textSub, borderBottom: `1px solid ${CSS.grayLight}` }}>
                  {m.status !== "not_started" ? "2026.02.27 14:30" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 파트 취합 현황 */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${CSS.grayBorder}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "11px 16px", borderBottom: `1px solid ${CSS.grayBorder}` }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: CSS.text }}>파트 취합 현황</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font }}>
          <thead>
            <tr>
              {["파트", "파트장", "취합 상태", "팀원 제출률"].map((h) => (
                <th
                  key={h}
                  style={{
                    background: CSS.tblHeader,
                    padding: "9px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: CSS.textSub,
                    textAlign: "left",
                    borderBottom: `1px solid ${CSS.grayBorder}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {partSummary.map((p, i) => (
              <tr key={p.part} style={{ background: i % 2 === 0 ? CSS.rowAlt : "#fff" }}>
                <td style={{ padding: "9px 12px", fontSize: 12.5, fontWeight: 600, color: CSS.text, borderBottom: `1px solid ${CSS.grayLight}` }}>{p.part} 파트</td>
                <td style={{ padding: "9px 12px", fontSize: 12.5, color: CSS.text, borderBottom: `1px solid ${CSS.grayLight}` }}>{p.leader}</td>
                <td style={{ padding: "9px 12px", borderBottom: `1px solid ${CSS.grayLight}` }}>{statusBadge(p.status)}</td>
                <td style={{ padding: "9px 12px", borderBottom: `1px solid ${CSS.grayLight}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, maxWidth: 120, height: 6, borderRadius: 3, background: CSS.grayLight }}>
                      <div
                        style={{
                          width: p.part === "DX" ? "100%" : "60%",
                          height: "100%",
                          borderRadius: 3,
                          background: p.part === "DX" ? CSS.ok : CSS.warn,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, color: CSS.textSub }}>{p.part === "DX" ? "4/4" : "3/5"}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Screen: My Weekly Report (Grid) ──
const MyWeeklyScreen = () => {
  const [focusedCell, setFocusedCell] = useState(null);
  const rows = [
    {
      id: 1, project: "팀공통", code: "공통2500",
      done: "[과제 수주 및 관리]\n*정량적, 정성적 목표 세부사항 정리\n ㄴ 과제 통합 관리 템플릿 작성 및 세부사항 정리 (초안작성완료)",
      plan: "[과제 수주 및 관리]\n*정량적, 정성적 목표 세부사항 정리\n ㄴ 과제 통합 관리 템플릿 작성 및 세부사항 정리 (계속)",
      note: "프로젝트별 수행 계획 수립 (DX 파트)\n ㄴ 사업계획 기준 계획 수립 (1차 3월 2주까지)",
    },
    {
      id: 2, project: "팀공통", code: "공통2500",
      done: "[조직운영관리]\n*2026년도 팀 목표 및 KPI 수립 방향 협의\n ㄴ 2026년도 팀 KPI 설정 방식 및 기준 작성 (진행중)\n ㄴ 2026년도 팀 KPI 목표 수립(진행중)",
      plan: "[조직운영관리]\n*2026년도 팀 목표 및 KPI 수립 방향 협의\n ㄴ 대표님 협의 후 결정 (예정)\n ㄴ 프로젝트별 수행 계획 (예정 ~ 3월 2주)",
      note: "조직운영\n ㄴ 2025년 팀 평가 제출",
    },
    {
      id: 3, project: "가상병원용인", code: "과제0023",
      done: "[시스템 실증]\n*가상병원 시스템 운영 전환 (2.10 화)\n ㄴ 운영전환 및 이슈사항 대응 - 시스템 모니터링",
      plan: "[시스템 실증]\n*가상병원 시스템 운영 모니터링 및 지원 (~ 계속)",
      note: "",
    },
    {
      id: 4, project: "비대면과제", code: "과제0024",
      done: "[웨어러블 의료기기 로지스틱 개발]\n*요구사항 분석 - IA 작성 방법 논의\n*과제 수행 관련 회의: 2.24 화",
      plan: "[웨어러블 의료기기 로지스틱 개발]\n*요구사항 분석 - IA 리뷰\n ㄴ 데이터항목정의서, 기능명세서",
      note: "",
    },
  ];

  // Render formatted text
  const renderFormatted = (text) => {
    if (!text) return <span style={{ color: CSS.textSub, fontStyle: "italic", fontSize: 11 }}>내용을 입력하세요</span>;
    return text.split("\n").map((line, i) => {
      const trimmed = line.trimStart();
      if (trimmed.startsWith("[") && trimmed.includes("]")) {
        return (
          <div key={i} style={{ fontWeight: 600, color: CSS.primary, fontSize: 12, marginBottom: 1, marginTop: i > 0 ? 3 : 0 }}>
            {trimmed}
          </div>
        );
      }
      if (trimmed.startsWith("*")) {
        return (
          <div key={i} style={{ paddingLeft: 8, fontSize: 12, color: CSS.text, lineHeight: 1.5 }}>
            <span style={{ color: CSS.textSub }}>•</span> {trimmed.slice(1).trim()}
          </div>
        );
      }
      if (trimmed.startsWith("ㄴ")) {
        return (
          <div key={i} style={{ paddingLeft: 18, fontSize: 11.5, color: CSS.textSub, lineHeight: 1.5 }}>
            ㄴ {trimmed.slice(1).trim()}
          </div>
        );
      }
      return (
        <div key={i} style={{ fontSize: 12, color: CSS.text, lineHeight: 1.5 }}>
          {trimmed}
        </div>
      );
    });
  };

  const thStyle = {
    background: CSS.tblHeader,
    padding: "9px 12px",
    fontSize: 12,
    fontWeight: 600,
    color: CSS.textSub,
    textAlign: "left",
    borderBottom: `1px solid ${CSS.grayBorder}`,
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    zIndex: 1,
  };

  const tdBase = {
    padding: "8px 12px",
    fontSize: 12.5,
    color: CSS.text,
    borderBottom: `1px solid ${CSS.grayLight}`,
    verticalAlign: "top",
    lineHeight: 1.5,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      {/* Toolbar */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${CSS.grayBorder}`,
          borderRadius: 8,
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Btn variant="ghost" size="sm">◀</Btn>
          <span style={{ fontSize: 13, fontWeight: 600, color: CSS.text }}>2026년 9주차</span>
          <span style={{ fontSize: 12, color: CSS.textSub }}>(2/23 ~ 2/27)</span>
          <Btn variant="ghost" size="sm">▶</Btn>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn variant="outline" size="sm">📋 전주 할일 불러오기</Btn>
          <Btn variant="outline" size="sm">+ 행 추가</Btn>
          <Btn variant="outline">임시저장</Btn>
          <Btn variant="primary">✓ 제출</Btn>
        </div>
      </div>

      {/* Grid Table */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${CSS.grayBorder}`,
          borderRadius: 8,
          overflow: "hidden",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ overflow: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font, tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "11%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "30%" }} />
              <col style={{ width: "30%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "3%" }} />
            </colgroup>
            <thead>
              <tr>
                <th style={thStyle}>프로젝트명</th>
                <th style={thStyle}>프로젝트코드</th>
                <th style={thStyle}>진행업무 (한일)</th>
                <th style={thStyle}>예정업무 (할일)</th>
                <th style={thStyle}>비고 및 이슈</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 === 0 ? CSS.rowAlt : "#fff" }}>
                  <td style={{ ...tdBase, fontWeight: 500 }}>
                    <div
                      style={{
                        padding: "4px 8px",
                        background: CSS.grayLight,
                        borderRadius: 4,
                        border: `1px solid ${CSS.grayBorder}`,
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {r.project}
                      <span style={{ fontSize: 9, color: CSS.textSub }}>▼</span>
                    </div>
                  </td>
                  <td style={{ ...tdBase, color: CSS.textSub, fontSize: 11.5, background: i % 2 === 0 ? "#f4f5f8" : "#fafbfc" }}>{r.code}</td>
                  <td
                    onClick={() => setFocusedCell(`done-${r.id}`)}
                    style={{
                      ...tdBase,
                      cursor: "text",
                      outline: focusedCell === `done-${r.id}` ? `2px solid ${CSS.primary}` : "none",
                      outlineOffset: -2,
                      borderRadius: focusedCell === `done-${r.id}` ? 2 : 0,
                    }}
                  >
                    {renderFormatted(r.done)}
                  </td>
                  <td
                    onClick={() => setFocusedCell(`plan-${r.id}`)}
                    style={{
                      ...tdBase,
                      cursor: "text",
                      outline: focusedCell === `plan-${r.id}` ? `2px solid ${CSS.primary}` : "none",
                      outlineOffset: -2,
                      borderRadius: focusedCell === `plan-${r.id}` ? 2 : 0,
                    }}
                  >
                    {renderFormatted(r.plan)}
                  </td>
                  <td
                    onClick={() => setFocusedCell(`note-${r.id}`)}
                    style={{
                      ...tdBase,
                      cursor: "text",
                      outline: focusedCell === `note-${r.id}` ? `2px solid ${CSS.primary}` : "none",
                      outlineOffset: -2,
                      borderRadius: focusedCell === `note-${r.id}` ? 2 : 0,
                    }}
                  >
                    {renderFormatted(r.note)}
                  </td>
                  <td style={{ ...tdBase, textAlign: "center" }}>
                    <span style={{ cursor: "pointer", fontSize: 13, color: CSS.textSub }}>⋮</span>
                  </td>
                </tr>
              ))}
              {/* Empty row for adding */}
              <tr style={{ background: "#fff" }}>
                <td style={{ ...tdBase, borderBottom: "none" }}>
                  <div
                    style={{
                      padding: "4px 8px",
                      border: `1px dashed ${CSS.grayBorder}`,
                      borderRadius: 4,
                      fontSize: 11,
                      color: CSS.textSub,
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    + 프로젝트 선택
                  </div>
                </td>
                <td style={{ ...tdBase, borderBottom: "none", color: CSS.textSub }}>—</td>
                <td style={{ ...tdBase, borderBottom: "none" }}></td>
                <td style={{ ...tdBase, borderBottom: "none" }}></td>
                <td style={{ ...tdBase, borderBottom: "none" }}></td>
                <td style={{ ...tdBase, borderBottom: "none" }}></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Expanded Edit Panel */}
        {focusedCell && (
          <div
            style={{
              borderTop: `2px solid ${CSS.primary}`,
              padding: "12px 16px",
              background: "#fafaff",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: CSS.primary }}>📝 셀 확대 편집</span>
                <span style={{ fontSize: 11, color: CSS.textSub }}>
                  {focusedCell.startsWith("done") ? "진행업무 (한일)" : focusedCell.startsWith("plan") ? "예정업무 (할일)" : "비고 및 이슈"}
                </span>
              </div>
              <Btn variant="ghost" size="sm" onClick={() => setFocusedCell(null)}>✕ 닫기</Btn>
            </div>
            <textarea
              style={{
                width: "100%",
                minHeight: 80,
                padding: 10,
                border: `1px solid ${CSS.grayBorder}`,
                borderRadius: 5,
                fontSize: 12.5,
                fontFamily: font,
                color: CSS.text,
                resize: "vertical",
                outline: "none",
                lineHeight: 1.6,
              }}
              defaultValue={(() => {
                const id = parseInt(focusedCell.split("-")[1]);
                const row = rows.find((r) => r.id === id);
                if (!row) return "";
                if (focusedCell.startsWith("done")) return row.done;
                if (focusedCell.startsWith("plan")) return row.plan;
                return row.note;
              })()}
              placeholder="내용을 입력하세요..."
              onFocus={(e) => (e.target.style.borderColor = CSS.primary)}
              onBlur={(e) => (e.target.style.borderColor = CSS.grayBorder)}
            />
            <div style={{ fontSize: 10.5, color: CSS.textSub }}>
              서식: <code style={{ background: CSS.grayLight, padding: "1px 4px", borderRadius: 3 }}>[업무항목명]</code>{" "}
              <code style={{ background: CSS.grayLight, padding: "1px 4px", borderRadius: 3 }}>*세부업무</code>{" "}
              <code style={{ background: CSS.grayLight, padding: "1px 4px", borderRadius: 3 }}>ㄴ상세작업</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Screen: Part Status (Read-only grid) ──
const PartStatusScreen = () => {
  const members = [
    {
      part: "DX", name: "정우철", rows: [
        { project: "팀공통", code: "공통2500", done: "[과제 수주 및 관리]\n*정량적, 정성적 목표 세부사항 정리\n ㄴ 과제 통합 관리 템플릿 작성 (초안작성완료)", plan: "[과제 수주 및 관리]\n*정량적, 정성적 목표 세부사항 정리\n ㄴ 템플릿 작성 (계속)", note: "프로젝트별 수행 계획 수립" },
        { project: "가상병원용인", code: "과제0023", done: "[시스템 실증]\n*가상병원 시스템 운영 전환 (2.10 화)", plan: "[시스템 실증]\n*시스템 운영 모니터링 및 지원", note: "" },
      ],
    },
    {
      part: "DX", name: "이성전", rows: [
        { project: "질병관리청 AX", code: "과제0027", done: "[공통]\n*통합 시스템 구축\n ㄴ GPU 서버 코로케이션 서비스 검토", plan: "[공통]\n*시스템 구성 협의/조정", note: "" },
      ],
    },
    {
      part: "DX", name: "김영상", rows: [
        { project: "5G 1세부", code: "과제0013", done: "[실증 준비]\n*02/24(화) 신광 방문 : 서버 재기동", plan: "[실증 준비]\n*전광판 연동 상용 Test 원격 지원", note: "비용절감사항" },
      ],
    },
  ];

  const renderFormatted = (text) => {
    if (!text) return <span style={{ color: CSS.textSub }}>—</span>;
    return text.split("\n").map((line, i) => {
      const trimmed = line.trimStart();
      if (trimmed.startsWith("[") && trimmed.includes("]"))
        return <div key={i} style={{ fontWeight: 600, color: CSS.primary, fontSize: 11.5, marginTop: i > 0 ? 2 : 0 }}>{trimmed}</div>;
      if (trimmed.startsWith("*"))
        return <div key={i} style={{ paddingLeft: 6, fontSize: 11.5, color: CSS.text, lineHeight: 1.5 }}>• {trimmed.slice(1).trim()}</div>;
      if (trimmed.startsWith("ㄴ"))
        return <div key={i} style={{ paddingLeft: 14, fontSize: 11, color: CSS.textSub, lineHeight: 1.5 }}>ㄴ {trimmed.slice(1).trim()}</div>;
      return <div key={i} style={{ fontSize: 11.5, color: CSS.text }}>{trimmed}</div>;
    });
  };

  const thStyle = {
    background: CSS.tblHeader, padding: "9px 10px", fontSize: 11.5, fontWeight: 600, color: CSS.textSub,
    textAlign: "left", borderBottom: `1px solid ${CSS.grayBorder}`, whiteSpace: "nowrap", position: "sticky", top: 0, zIndex: 1,
  };
  const tdBase = { padding: "7px 10px", fontSize: 12, color: CSS.text, borderBottom: `1px solid ${CSS.grayLight}`, verticalAlign: "top" };

  let globalIdx = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      {/* Filter Bar */}
      <div style={{ background: "#fff", border: `1px solid ${CSS.grayBorder}`, borderRadius: 8, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: CSS.textSub }}>파트</span>
        <select style={{ height: 30, padding: "0 10px", border: `1px solid ${CSS.grayBorder}`, borderRadius: 5, fontSize: 12.5, fontFamily: font }}>
          <option>DX 파트</option>
          <option>AX 파트</option>
          <option>전체</option>
        </select>
        <span style={{ fontSize: 12, fontWeight: 600, color: CSS.textSub, marginLeft: 8 }}>팀원</span>
        <select style={{ height: 30, padding: "0 10px", border: `1px solid ${CSS.grayBorder}`, borderRadius: 5, fontSize: 12.5, fontFamily: font }}>
          <option>전체</option>
          <option>정우철</option>
          <option>이성전</option>
          <option>김영상</option>
          <option>권현하</option>
        </select>
        <span style={{ fontSize: 12, fontWeight: 600, color: CSS.textSub, marginLeft: 8 }}>프로젝트</span>
        <select style={{ height: 30, padding: "0 10px", border: `1px solid ${CSS.grayBorder}`, borderRadius: 5, fontSize: 12.5, fontFamily: font }}>
          <option>전체</option>
          <option>팀공통</option>
          <option>가상병원용인</option>
          <option>질병관리청 AX</option>
        </select>
        <div style={{ flex: 1 }} />
        <Btn variant="outline" size="sm">📥 Excel 내보내기</Btn>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: `1px solid ${CSS.grayBorder}`, borderRadius: 8, overflow: "hidden", flex: 1 }}>
        <div style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${CSS.grayBorder}` }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: CSS.text }}>DX 파트 업무 현황</span>
          <span style={{ fontSize: 12, color: CSS.textSub }}>2026년 9주차 (2/23 ~ 2/27)</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: CSS.textSub }}>
            작성: 정우철 <span style={{ color: CSS.ok }}>✓</span> · 이성전 <span style={{ color: CSS.ok }}>✓</span> · 김영상 <span style={{ color: CSS.ok }}>✓</span> · 권현하{" "}
            <span style={{ color: CSS.warn }}>⏳</span>
          </span>
        </div>
        <div style={{ overflow: "auto", maxHeight: 450 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font, tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "28%" }} />
              <col style={{ width: "28%" }} />
              <col style={{ width: "18%" }} />
            </colgroup>
            <thead>
              <tr>
                <th style={thStyle}>파트</th>
                <th style={thStyle}>성명</th>
                <th style={thStyle}>프로젝트명</th>
                <th style={thStyle}>코드</th>
                <th style={thStyle}>진행업무 (한일)</th>
                <th style={thStyle}>예정업무 (할일)</th>
                <th style={thStyle}>비고 및 이슈</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) =>
                m.rows.map((r, ri) => {
                  const idx = globalIdx++;
                  return (
                    <tr key={`${m.name}-${ri}`} style={{ background: idx % 2 === 0 ? CSS.rowAlt : "#fff" }}>
                      {ri === 0 && (
                        <td rowSpan={m.rows.length} style={{ ...tdBase, textAlign: "center", borderRight: `1px solid ${CSS.grayLight}`, fontWeight: 600, fontSize: 11.5 }}>
                          <Badge type={m.part === "DX" ? "blue" : "purple"}>{m.part}</Badge>
                        </td>
                      )}
                      {ri === 0 && (
                        <td rowSpan={m.rows.length} style={{ ...tdBase, fontWeight: 500, borderRight: `1px solid ${CSS.grayLight}`, fontSize: 12 }}>
                          {m.name}
                        </td>
                      )}
                      <td style={{ ...tdBase, fontSize: 11.5, fontWeight: 500 }}>{r.project}</td>
                      <td style={{ ...tdBase, fontSize: 11, color: CSS.textSub }}>{r.code}</td>
                      <td style={tdBase}>{renderFormatted(r.done)}</td>
                      <td style={tdBase}>{renderFormatted(r.plan)}</td>
                      <td style={{ ...tdBase, fontSize: 11.5, color: r.note ? CSS.text : CSS.textSub }}>{r.note || "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Screen: Project Management ──
const ProjectMgmtScreen = () => {
  const projects = [
    { name: "팀공통", code: "공통2500", cat: "공통업무", status: "active", members: 9 },
    { name: "DX공통", code: "공통2500", cat: "공통업무", status: "active", members: 4 },
    { name: "AX공통", code: "공통2500", cat: "공통업무", status: "active", members: 5 },
    { name: "5G 1세부(현장수요)", code: "과제0013", cat: "업무수행", status: "active", members: 1 },
    { name: "5G 3세부(재난현장)", code: "과제0014", cat: "업무수행", status: "active", members: 1 },
    { name: "가상병원용인", code: "과제0023", cat: "업무수행", status: "active", members: 2 },
    { name: "비대면과제", code: "과제0024", cat: "업무수행", status: "active", members: 3 },
    { name: "스케일업팁스일산", code: "과제0026", cat: "업무수행", status: "active", members: 4 },
    { name: "질병관리청 AX", code: "과제0027", cat: "업무수행", status: "active", members: 6 },
    { name: "가상병원_한림(2025년)", code: "HAX-의료-25004", cat: "업무수행", status: "active", members: 1 },
    { name: "AI영상검사", code: "과제0011", cat: "업무수행", status: "hold", members: 1 },
  ];

  const thStyle = {
    background: CSS.tblHeader, padding: "9px 12px", fontSize: 12, fontWeight: 600, color: CSS.textSub,
    textAlign: "left", borderBottom: `1px solid ${CSS.grayBorder}`, whiteSpace: "nowrap",
  };
  const tdBase = { padding: "9px 12px", fontSize: 12.5, color: CSS.text, borderBottom: `1px solid ${CSS.grayLight}` };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <SumCard icon="📂" iconBg="#eef2ff" label="전체 프로젝트" value="11" sub="공통 3 · 수행 8" />
        <SumCard icon="🟢" iconBg={CSS.okBg} label="진행중" value="10" />
        <SumCard icon="⏸️" iconBg={CSS.warnBg} label="보류" value="1" sub="AI영상검사" />
      </div>

      <div style={{ background: "#fff", border: `1px solid ${CSS.grayBorder}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${CSS.grayBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: CSS.text }}>프로젝트 목록</span>
            <span style={{ fontSize: 12, color: CSS.textSub }}>총 {projects.length}건</span>
          </div>
          <Btn variant="primary" size="sm">+ 프로젝트 추가</Btn>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font }}>
          <thead>
            <tr>
              {["프로젝트명", "프로젝트코드", "분류", "상태", "참여인원", "관리"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => (
              <tr key={p.name} style={{ background: i % 2 === 0 ? CSS.rowAlt : "#fff" }}>
                <td style={{ ...tdBase, fontWeight: 500 }}>{p.name}</td>
                <td style={{ ...tdBase, fontFamily: "monospace", fontSize: 11.5, color: CSS.textSub }}>{p.code}</td>
                <td style={tdBase}>
                  <Badge type={p.cat === "공통업무" ? "purple" : "blue"}>{p.cat}</Badge>
                </td>
                <td style={tdBase}>
                  <Badge type={p.status === "active" ? "ok" : "warn"}>{p.status === "active" ? "진행중" : "보류"}</Badge>
                </td>
                <td style={{ ...tdBase, color: CSS.textSub }}>{p.members}명</td>
                <td style={tdBase}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <Btn variant="outline" size="sm">수정</Btn>
                    <Btn variant="ghost" size="sm" style={{ color: CSS.danger }}>삭제</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Main App ──
export default function App() {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const screenMap = {
    dashboard: { title: "대시보드", subtitle: "주간업무 작성 현황", component: <DashboardScreen /> },
    "my-weekly": { title: "내 주간업무 작성", subtitle: "2026년 9주차", component: <MyWeeklyScreen /> },
    "part-status": { title: "파트 업무 현황", subtitle: "DX 파트", component: <PartStatusScreen /> },
    "project-mgmt": { title: "프로젝트 관리", subtitle: "기준정보 설정", component: <ProjectMgmtScreen /> },
  };

  const current = screenMap[activeMenu] || screenMap.dashboard;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: font, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d0d3d8; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #b0b4bb; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        table { border-spacing: 0; }
        button:hover { filter: brightness(0.96); }
        textarea:focus { border-color: ${CSS.primary} !important; }
      `}</style>

      <Sidebar activeMenu={activeMenu} onNavigate={setActiveMenu} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header title={current.title} subtitle={current.subtitle} />
        <div
          style={{
            flex: 1,
            padding: "18px 20px",
            background: CSS.grayLight,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {current.component}
        </div>
      </div>
    </div>
  );
}
