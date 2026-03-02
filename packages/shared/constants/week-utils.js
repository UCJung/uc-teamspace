"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeekLabel = getWeekLabel;
exports.getWeekStart = getWeekStart;
exports.getWeekRange = getWeekRange;
exports.getPreviousWeekLabel = getPreviousWeekLabel;
exports.getNextWeekLabel = getNextWeekLabel;
exports.getCurrentWeekLabel = getCurrentWeekLabel;
exports.formatWeekLabel = formatWeekLabel;
function getISOWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return weekNumber;
}
function getISOWeekYear(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    return d.getUTCFullYear();
}
function getWeekLabel(date) {
    const year = getISOWeekYear(date);
    const week = getISOWeekNumber(date);
    return `${year}-W${String(week).padStart(2, '0')}`;
}
function getWeekStart(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setUTCDate(d.getUTCDate() + diff);
    return d;
}
function getWeekRange(weekLabel) {
    const match = weekLabel.match(/^(\d{4})-W(\d{2})$/);
    if (!match) {
        throw new Error(`Invalid weekLabel format: "${weekLabel}". Expected "YYYY-WNN".`);
    }
    const year = parseInt(match[1], 10);
    const week = parseInt(match[2], 10);
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7;
    const week1Monday = new Date(Date.UTC(year, 0, 4 - jan4Day + 1));
    const start = new Date(week1Monday.getTime() + (week - 1) * 7 * 86400000);
    const end = new Date(start.getTime() + 4 * 86400000);
    return { start, end };
}
function getPreviousWeekLabel(weekLabel) {
    const { start } = getWeekRange(weekLabel);
    const prevMonday = new Date(start.getTime() - 7 * 86400000);
    return getWeekLabel(prevMonday);
}
function getNextWeekLabel(weekLabel) {
    const { start } = getWeekRange(weekLabel);
    const nextMonday = new Date(start.getTime() + 7 * 86400000);
    return getWeekLabel(nextMonday);
}
function getCurrentWeekLabel() {
    return getWeekLabel(new Date());
}
function formatWeekLabel(weekLabel) {
    const year = getISOWeekYear(new Date(getWeekRange(weekLabel).start));
    const week = parseInt(weekLabel.split('-W')[1], 10);
    const { start, end } = getWeekRange(weekLabel);
    const startStr = `${start.getUTCMonth() + 1}/${start.getUTCDate()}`;
    const endStr = `${end.getUTCMonth() + 1}/${end.getUTCDate()}`;
    return `${year}년 ${week}주차 (${startStr} ~ ${endStr})`;
}
//# sourceMappingURL=week-utils.js.map