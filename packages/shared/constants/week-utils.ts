/**
 * ISO 8601 주차 계산 유틸리티
 * 프론트엔드·백엔드 공용
 */

/**
 * 주어진 날짜의 ISO 주차 번호를 반환한다.
 * ISO 8601: 목요일이 속한 연도의 주차를 기준으로 한다.
 */
function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // 목요일로 이동 (ISO 주차 기준)
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNumber;
}

/**
 * 주어진 날짜의 ISO 주차 연도를 반환한다.
 */
function getISOWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return d.getUTCFullYear();
}

/**
 * 날짜 → "2026-W09" 형식의 주차 라벨 반환
 */
export function getWeekLabel(date: Date): string {
  const year = getISOWeekYear(date);
  const week = getISOWeekNumber(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * 날짜 → 해당 주 월요일 00:00:00 UTC 반환
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day; // 일요일이면 -6, 아니면 1-day
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

/**
 * 주차 라벨 → { start: 월요일, end: 금요일 } UTC Date 반환
 */
export function getWeekRange(weekLabel: string): { start: Date; end: Date } {
  const match = weekLabel.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid weekLabel format: "${weekLabel}". Expected "YYYY-WNN".`);
  }
  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);

  // 해당 연도 1월 4일 (항상 ISO 주차 1에 포함)
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  // ISO 주차 1의 월요일
  const week1Monday = new Date(Date.UTC(year, 0, 4 - jan4Day + 1));
  // 목표 주차의 월요일
  const start = new Date(week1Monday.getTime() + (week - 1) * 7 * 86400000);
  // 금요일
  const end = new Date(start.getTime() + 4 * 86400000);

  return { start, end };
}

/**
 * 주차 라벨 → 이전 주차 라벨 반환
 */
export function getPreviousWeekLabel(weekLabel: string): string {
  const { start } = getWeekRange(weekLabel);
  const prevMonday = new Date(start.getTime() - 7 * 86400000);
  return getWeekLabel(prevMonday);
}

/**
 * 주차 라벨 → 다음 주차 라벨 반환
 */
export function getNextWeekLabel(weekLabel: string): string {
  const { start } = getWeekRange(weekLabel);
  const nextMonday = new Date(start.getTime() + 7 * 86400000);
  return getWeekLabel(nextMonday);
}

/**
 * 주차 라벨에 n주를 더하거나 빼서 새 주차 라벨 반환
 * 예: addWeeks("2026-W09", 1) → "2026-W10"
 *     addWeeks("2026-W09", -1) → "2026-W08"
 */
export function addWeeks(weekLabel: string, n: number): string {
  const match = weekLabel.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return weekLabel;
  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(Date.UTC(year, 0, 4 - jan4Day + 1));
  const monday = new Date(week1Monday.getTime() + (week - 1 + n) * 7 * 86400000);
  return getWeekLabel(monday);
}

/**
 * 현재 날짜 기준 주차 라벨 반환
 */
export function getCurrentWeekLabel(): string {
  return getWeekLabel(new Date());
}

/**
 * 주차 라벨 → 사람이 읽기 쉬운 형식으로 변환
 * 예: "2026-W09" → "2026년 9주차 (2/23 ~ 2/27)"
 */
export function formatWeekLabel(weekLabel: string): string {
  const year = getISOWeekYear(new Date(getWeekRange(weekLabel).start));
  const week = parseInt(weekLabel.split('-W')[1], 10);
  const { start, end } = getWeekRange(weekLabel);
  const startStr = `${start.getUTCMonth() + 1}/${start.getUTCDate()}`;
  const endStr = `${end.getUTCMonth() + 1}/${end.getUTCDate()}`;
  return `${year}년 ${week}주차 (${startStr} ~ ${endStr})`;
}
