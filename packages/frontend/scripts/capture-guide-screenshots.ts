/**
 * 사용가이드 스크린샷 자동 캡처 스크립트
 *
 * 실행 전제: 백엔드(localhost:3000) + 프론트엔드(localhost:5173) 실행 중
 * 실행 방법: cd packages/frontend && bunx tsx scripts/capture-guide-screenshots.ts
 */
import { chromium, type Page, type Browser } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename_ = fileURLToPath(import.meta.url);
const __dirname_ = path.dirname(__filename_);

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const SCREENSHOT_DIR = path.resolve(__dirname_, '../public/guide/screenshots');
const PASSWORD = 'password123';

/* ─── 헬퍼 함수 ─── */

async function capture(page: Page, name: string): Promise<void> {
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`  ✓ ${name}.png`);
}

async function wait(page: Page, ms = 800): Promise<void> {
  await page.waitForTimeout(ms);
}

async function login(page: Page, email: string): Promise<boolean> {
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"], input[name="email"]', email);
    await page.fill('input[type="password"], input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
    await wait(page, 1000);
    return true;
  } catch (e) {
    console.error(`  ✗ Login failed for ${email}:`, (e as Error).message);
    return false;
  }
}

/** 로그인 후 팀 선택 처리 — /teams 페이지에서 첫 번째 소속팀 클릭 */
async function selectTeamIfNeeded(page: Page): Promise<void> {
  // 이미 팀 선택되어 다른 페이지로 이동했으면 스킵
  if (!page.url().includes('/teams')) return;

  try {
    // "내 소속팀" 섹션의 팀 버튼 또는 목록의 "선택" 버튼 클릭
    const quickSelect = page.locator('button:has-text("선택")').first();
    if (await quickSelect.isVisible({ timeout: 3000 })) {
      await quickSelect.click();
      await page.waitForURL((url) => !url.pathname.includes('/teams'), { timeout: 5000 });
      await wait(page, 1000);
      return;
    }

    // 소속팀 이름 버튼 클릭 (quick select 영역)
    const teamButton = page.locator('[data-team-select]').first();
    if (await teamButton.isVisible({ timeout: 2000 })) {
      await teamButton.click();
      await page.waitForURL((url) => !url.pathname.includes('/teams'), { timeout: 5000 });
      await wait(page, 1000);
    }
  } catch (e) {
    console.error('  ⚠ Team selection failed:', (e as Error).message);
  }
}

/** 안전하게 페이지 이동 (팀 선택 리다이렉트 방지) */
async function navigateTo(page: Page, pagePath: string): Promise<void> {
  await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'networkidle' });
  await wait(page, 1000);

  // /teams로 리다이렉트된 경우 팀 재선택
  if (page.url().includes('/teams') && pagePath !== '/teams') {
    await selectTeamIfNeeded(page);
    // 원래 페이지로 다시 이동
    await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'networkidle' });
    await wait(page, 1000);
  }
}

/** 모달이 열릴 때까지 대기 후 캡처, 그 다음 닫기 */
async function captureModal(
  page: Page,
  name: string,
  openAction: () => Promise<void>,
): Promise<void> {
  try {
    await openAction();
    // Radix Dialog, role=dialog, 또는 커스텀 fixed overlay 모달 대기
    await page
      .locator('[role="dialog"], [data-radix-dialog-content], .fixed.inset-0.z-50')
      .first()
      .waitFor({ state: 'visible', timeout: 3000 });
    await wait(page, 500);
    await capture(page, name);

    // 모달 닫기: ESC 키 시도 후 아직 열려있으면 닫기/취소 버튼 클릭
    await page.keyboard.press('Escape');
    await wait(page, 300);
    const stillOpen = await page
      .locator('.fixed.inset-0.z-50, [role="dialog"]')
      .first()
      .isVisible()
      .catch(() => false);
    if (stillOpen) {
      const closeBtn = page.locator('button:has-text("취소"), button:has-text("닫기"), [aria-label="Close"]').first();
      if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await closeBtn.click();
        await wait(page, 300);
      } else {
        // backdrop 클릭으로 닫기
        await page.mouse.click(10, 10);
        await wait(page, 300);
      }
    }
  } catch (e) {
    console.error(`  ⚠ Modal capture failed (${name}):`, (e as Error).message);
  }
}

/* ─── 캡처 시나리오 ─── */

async function captureCommon(browser: Browser): Promise<void> {
  console.log('\n[common] 공통 페이지 캡처...');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // 로그인 화면
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await wait(page);
  await capture(page, 'common-login');

  // 계정 신청 화면
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
  await wait(page);
  await capture(page, 'common-register');

  await ctx.close();
}

async function captureMember(browser: Browser): Promise<void> {
  console.log('\n[member] 팀원 가이드 캡처...');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  if (!(await login(page, 'dx.member1@example.com'))) { await ctx.close(); return; }

  // 팀 선택 화면 (로그인 직후)
  if (page.url().includes('/teams')) {
    await capture(page, 'common-teams');
    await selectTeamIfNeeded(page);
  }

  // 대시보드
  await navigateTo(page, '/');
  await capture(page, 'member-dashboard');

  // 주간업무 작성 (빈 화면)
  await navigateTo(page, '/my-weekly');
  await capture(page, 'member-weekly-empty');

  // 주간업무 — 전주 불러오기 팝업 (버튼이 있을 경우)
  const carryBtn = page.locator('button:has-text("전주"), button:has-text("불러오기")').first();
  if (await carryBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await captureModal(page, 'member-carry-forward-modal', () => carryBtn.click());
  }

  // 주간업무 — 프로젝트 추가 팝업 (버튼이 있을 경우)
  const addProjectBtn = page.locator('button:has-text("프로젝트 추가"), button:has-text("행 추가")').first();
  if (await addProjectBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await captureModal(page, 'member-project-select-modal', () => addProjectBtn.click());
  }

  await ctx.close();
}

async function capturePartLeader(browser: Browser): Promise<void> {
  console.log('\n[part-leader] 파트장 가이드 캡처...');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  if (!(await login(page, 'ax.partleader@example.com'))) { await ctx.close(); return; }
  await selectTeamIfNeeded(page);

  // 업무현황
  await navigateTo(page, '/part-status');
  await capture(page, 'part-leader-part-status');

  // 보고서 취합
  await navigateTo(page, '/report-consolidation');
  await capture(page, 'part-leader-report-consolidation');

  // 보고서 취합 — 불러오기 팝업
  const loadBtn = page.locator('button:has-text("불러오기"), button:has-text("업무 불러오기")').first();
  if (await loadBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await captureModal(page, 'part-leader-load-rows-modal', () => loadBtn.click());
  }

  await ctx.close();
}

async function captureLeader(browser: Browser): Promise<void> {
  console.log('\n[leader] 팀장 가이드 캡처...');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  if (!(await login(page, 'leader@example.com'))) { await ctx.close(); return; }
  await selectTeamIfNeeded(page);

  // 대시보드
  await navigateTo(page, '/');
  await capture(page, 'leader-dashboard');

  // 팀·파트 관리
  await navigateTo(page, '/team-mgmt');
  await capture(page, 'leader-team-mgmt');

  // 팀원 등록 모달
  const addMemberBtn = page.locator('button:has-text("팀원 등록")').first();
  if (await addMemberBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await captureModal(page, 'leader-member-create-modal', () => addMemberBtn.click());
  }

  // 프로젝트 관리
  await navigateTo(page, '/project-mgmt');
  await capture(page, 'leader-project-mgmt');

  // 프로젝트 추가 모달
  const addProjBtn = page.locator('button:has-text("프로젝트 추가")').first();
  if (await addProjBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await captureModal(page, 'leader-project-add-modal', () => addProjBtn.click());
  }

  // 보고서 취합
  await navigateTo(page, '/report-consolidation');
  await capture(page, 'leader-report-consolidation');

  await ctx.close();
}

async function captureAdmin(browser: Browser): Promise<void> {
  console.log('\n[admin] Admin 가이드 캡처...');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  if (!(await login(page, 'admin@system.local'))) { await ctx.close(); return; }
  // Admin은 팀 선택 불필요 (AppLayout에서 스킵)

  // 계정 관리
  await navigateTo(page, '/admin/accounts');
  await capture(page, 'admin-accounts');

  // 팀 관리
  await navigateTo(page, '/admin/teams');
  await capture(page, 'admin-teams');

  // 프로젝트 관리
  await navigateTo(page, '/admin/projects');
  await capture(page, 'admin-projects');

  // 프로젝트 생성 모달
  const createProjBtn = page.locator('button:has-text("프로젝트 생성")').first();
  if (await createProjBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await captureModal(page, 'admin-project-create-modal', () => createProjBtn.click());
  }

  await ctx.close();
}

/* ─── 메인 ─── */

async function main() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('스크린샷 저장 경로:', SCREENSHOT_DIR);
  const browser = await chromium.launch({ headless: true });

  try {
    await captureCommon(browser);
    await captureMember(browser);
    await capturePartLeader(browser);
    await captureLeader(browser);
    await captureAdmin(browser);
  } finally {
    await browser.close();
  }

  console.log('\n✓ 완료! 스크린샷 저장 경로:', SCREENSHOT_DIR);
}

main().catch(console.error);
