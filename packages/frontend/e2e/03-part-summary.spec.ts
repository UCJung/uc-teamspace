import { test, expect } from '@playwright/test';

/**
 * E2E 테스트 시나리오 #3: 파트 취합 워크플로우 (PART_LEADER)
 * E2E 테스트 시나리오 #4: 팀장 전체 조회 + Excel 내보내기 (LEADER)
 *
 * 사전 조건:
 * - 백엔드 서버 실행 중 (localhost:3000)
 * - 프론트엔드 서버 실행 중 (localhost:5173)
 * - DB 시드 데이터 적용 완료
 *   - PART_LEADER 계정: ax.partleader@example.com / Test1234!
 *   - LEADER 계정: leader@example.com / Test1234!
 */

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const PART_LEADER_EMAIL = process.env.E2E_PART_LEADER_EMAIL || 'ax.partleader@example.com';
const PART_LEADER_PASSWORD = process.env.E2E_PART_LEADER_PASSWORD || 'Test1234!';
const LEADER_EMAIL = process.env.E2E_LEADER_EMAIL || 'leader@example.com';
const LEADER_PASSWORD = process.env.E2E_LEADER_PASSWORD || 'Test1234!';

async function loginAs(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
) {
  await page.goto(BASE_URL + '/login');
  await page.getByLabel(/이메일/i).fill(email);
  await page.getByLabel(/비밀번호/i).fill(password);
  await page.getByRole('button', { name: /로그인/i }).click();
  await page.waitForURL(BASE_URL + '/', { timeout: 10000 });
}

test.describe('파트 취합 (시나리오 #3)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, PART_LEADER_EMAIL, PART_LEADER_PASSWORD);
  });

  test('파트 현황 페이지 진입', async ({ page }) => {
    await page.goto(BASE_URL + '/part-status');
    await expect(page.getByText('파트원 작성 현황')).toBeVisible({ timeout: 5000 });
  });

  test('파트 취합보고 페이지 진입', async ({ page }) => {
    await page.goto(BASE_URL + '/part-summary');
    await expect(page.getByText('자동 취합')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('팀장 전체 조회 (시나리오 #4)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, LEADER_EMAIL, LEADER_PASSWORD);
  });

  test('팀 현황 페이지 진입', async ({ page }) => {
    await page.goto(BASE_URL + '/team-status');
    await expect(page.getByText('팀 작성 현황')).toBeVisible({ timeout: 5000 });
  });

  test('팀 현황 파트 탭 확인', async ({ page }) => {
    await page.goto(BASE_URL + '/team-status');
    await expect(page.getByText('전체')).toBeVisible({ timeout: 5000 });
  });

  test('Excel 내보내기 버튼 존재 확인', async ({ page }) => {
    await page.goto(BASE_URL + '/team-status');
    await expect(page.getByText('Excel 내보내기')).toBeVisible({ timeout: 5000 });
  });

  test('팀 관리 페이지 테이블 헤더 렌더링', async ({ page }) => {
    await page.goto(BASE_URL + '/team-mgmt');
    await expect(page.getByText('이름')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('이메일')).toBeVisible();
    await expect(page.getByText('파트')).toBeVisible();
    await expect(page.getByText('역할')).toBeVisible();
    await expect(page.getByText('상태')).toBeVisible();
  });

  test('팀 관리 페이지 팀원 등록 버튼 존재', async ({ page }) => {
    await page.goto(BASE_URL + '/team-mgmt');
    await expect(page.getByText('+ 팀원 등록')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('역할별 접근 제한 (시나리오 #5)', () => {
  test('PART_LEADER는 팀 관리 페이지 접근 불가', async ({ page }) => {
    await loginAs(page, PART_LEADER_EMAIL, PART_LEADER_PASSWORD);
    await page.goto(BASE_URL + '/team-mgmt');
    // RoleGuard에 의해 리다이렉트 또는 접근 거부
    await expect(page).not.toHaveURL(BASE_URL + '/team-mgmt');
  });

  test('PART_LEADER는 팀 현황 페이지 접근 불가', async ({ page }) => {
    await loginAs(page, PART_LEADER_EMAIL, PART_LEADER_PASSWORD);
    await page.goto(BASE_URL + '/team-status');
    await expect(page).not.toHaveURL(BASE_URL + '/team-status');
  });
});
