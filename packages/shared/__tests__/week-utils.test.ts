import { describe, test, expect } from 'bun:test';
import {
  getWeekLabel,
  getWeekStart,
  getWeekRange,
  getPreviousWeekLabel,
  getNextWeekLabel,
  formatWeekLabel,
} from '../constants/week-utils';

describe('week-utils', () => {
  test('getWeekLabel returns correct ISO week label', () => {
    // 2026-02-23 is Monday of W09
    const date = new Date(Date.UTC(2026, 1, 23));
    expect(getWeekLabel(date)).toBe('2026-W09');
  });

  test('getWeekLabel handles Sunday correctly', () => {
    // 2026-03-01 is Sunday, still W09
    const date = new Date(Date.UTC(2026, 2, 1));
    expect(getWeekLabel(date)).toBe('2026-W09');
  });

  test('getWeekStart returns Monday 00:00 UTC', () => {
    // 2026-02-25 is Wednesday
    const date = new Date(Date.UTC(2026, 1, 25));
    const monday = getWeekStart(date);
    expect(monday.getUTCDay()).toBe(1); // Monday
    expect(monday.getUTCDate()).toBe(23);
    expect(monday.getUTCHours()).toBe(0);
  });

  test('getWeekRange returns Monday to Friday', () => {
    const { start, end } = getWeekRange('2026-W09');
    expect(start.getUTCDay()).toBe(1); // Monday
    expect(end.getUTCDay()).toBe(5); // Friday
    expect(start.getUTCFullYear()).toBe(2026);
    expect(start.getUTCMonth()).toBe(1); // February
    expect(start.getUTCDate()).toBe(23);
    expect(end.getUTCDate()).toBe(27);
  });

  test('getWeekRange throws on invalid format', () => {
    expect(() => getWeekRange('2026-09')).toThrow();
    expect(() => getWeekRange('invalid')).toThrow();
  });

  test('getPreviousWeekLabel returns previous week', () => {
    expect(getPreviousWeekLabel('2026-W09')).toBe('2026-W08');
    expect(getPreviousWeekLabel('2026-W01')).toBe('2025-W52');
  });

  test('getNextWeekLabel returns next week', () => {
    expect(getNextWeekLabel('2026-W09')).toBe('2026-W10');
  });

  test('formatWeekLabel returns human-readable format', () => {
    const formatted = formatWeekLabel('2026-W09');
    expect(formatted).toContain('2026년');
    expect(formatted).toContain('9주차');
    expect(formatted).toContain('2/23');
    expect(formatted).toContain('2/27');
  });
});
