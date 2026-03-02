/**
 * seed-weekly-data.ts
 * Excel 주간업무 파일을 파싱하여 WeeklyReport + WorkItem + PartSummary + SummaryWorkItem 시드 데이터 생성
 *
 * 실행: bunx tsx prisma/seed-weekly-data.ts
 *       또는 bun run seed:weekly (package.json 등록 후)
 */

import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import path from 'path';

const prisma = new PrismaClient();

// ──────────── 경로 설정 ────────────
const EXCEL_FILE = path.resolve(__dirname, '../../../docs/선행연구개발팀_주간업무.xlsx');

// ──────────── 주간업무 시트 → weekLabel/weekStart 매핑 ────────────
const WEEKLY_SHEET_MAP: Record<string, { weekLabel: string; weekStart: Date }> = {
  '20260206': { weekLabel: '2026-W06', weekStart: new Date('2026-02-02T00:00:00Z') },
  '20260213': { weekLabel: '2026-W07', weekStart: new Date('2026-02-09T00:00:00Z') },
  '20260227': { weekLabel: '2026-W09', weekStart: new Date('2026-02-23T00:00:00Z') },
};

// ──────────── 파트취합 시트 매핑 ────────────
const PART_SUMMARY_SHEETS: Record<string, { partName: string; weekLabel: string; weekStart: Date }> = {
  '20260206_DX': { partName: 'DX', weekLabel: '2026-W06', weekStart: new Date('2026-02-02T00:00:00Z') },
};

// ──────────── 셀 값 추출 헬퍼 ────────────
function getCellText(cell: ExcelJS.Cell): string {
  const val = cell.value;

  if (val === null || val === undefined) return '';

  // richText 형식 (줄바꿈 포함 텍스트)
  if (typeof val === 'object' && 'richText' in val) {
    return (val as ExcelJS.CellRichTextValue).richText
      .map((rt) => rt.text)
      .join('')
      .trim();
  }

  // 수식 셀 (VLOOKUP 등)
  if (typeof val === 'object' && 'result' in val) {
    const result = (val as ExcelJS.CellFormulaValue).result;
    if (result === null || result === undefined) return '';
    if (typeof result === 'object' && 'richText' in result) {
      return (result as ExcelJS.CellRichTextValue).richText
        .map((rt) => rt.text)
        .join('')
        .trim();
    }
    return String(result).trim();
  }

  // 날짜 객체
  if (val instanceof Date) return val.toISOString();

  return String(val).trim();
}

// ──────────── TASK-01: WeeklyReport + WorkItem 시드 ────────────
async function seedWeeklyReports(
  wb: ExcelJS.Workbook,
  memberMap: Map<string, string>,
  projectMap: Map<string, string>,
): Promise<{ reportCount: number; itemCount: number; skippedRows: number }> {
  let reportCount = 0;
  let itemCount = 0;
  let skippedRows = 0;

  for (const [sheetName, { weekLabel, weekStart }] of Object.entries(WEEKLY_SHEET_MAP)) {
    const ws = wb.getWorksheet(sheetName);
    if (!ws) {
      console.warn(`  [경고] 시트 "${sheetName}" 없음 — 건너뜀`);
      continue;
    }

    console.log(`\n  [시트] ${sheetName} (${weekLabel}) 처리 중...`);

    // 팀원별 sortOrder 추적
    const memberSortOrder = new Map<string, number>();

    let rowNum = 0;
    ws.eachRow((row, idx) => {
      if (idx === 1) return; // 헤더 행 스킵
      rowNum = idx;

      const memberName = getCellText(row.getCell(2));
      if (!memberName) {
        skippedRows++;
        return; // 성명 없는 행 스킵
      }

      const memberId = memberMap.get(memberName);
      if (!memberId) {
        console.warn(`    [경고] 팀원 미매핑: "${memberName}" — 행 ${idx} 건너뜀`);
        skippedRows++;
        return;
      }

      const projectName = getCellText(row.getCell(3));
      const projectId = projectName ? projectMap.get(projectName) : undefined;
      if (projectName && !projectId) {
        console.warn(`    [경고] 프로젝트 미매핑: "${projectName}" (행 ${idx}) — projectId null로 처리`);
      }

      const doneWork = getCellText(row.getCell(5));
      const planWork = getCellText(row.getCell(6));
      const remarks = getCellText(row.getCell(7));

      // doneWork, planWork 모두 비어있으면 스킵
      if (!doneWork && !planWork) {
        skippedRows++;
        return;
      }

      // 비동기 작업을 동기 컨텍스트에서 처리하기 위해 Promise 배열로 수집
      weeklyRowData.push({
        memberId,
        weekStart,
        weekLabel,
        projectId: projectId || null,
        doneWork,
        planWork,
        remarks: remarks || null,
        memberName,
        rowIdx: idx,
      });
    });
  }

  // 수집된 행 데이터를 순차 처리 (upsert WeeklyReport + create WorkItem)
  const reportCache = new Map<string, string>(); // "memberId:weekStart" → reportId

  for (const data of weeklyRowData) {
    const cacheKey = `${data.memberId}:${data.weekStart.toISOString()}`;

    let reportId = reportCache.get(cacheKey);
    if (!reportId) {
      const report = await prisma.weeklyReport.upsert({
        where: {
          memberId_weekStart: {
            memberId: data.memberId,
            weekStart: data.weekStart,
          },
        },
        update: { status: 'SUBMITTED', weekLabel: data.weekLabel },
        create: {
          memberId: data.memberId,
          weekStart: data.weekStart,
          weekLabel: data.weekLabel,
          status: 'SUBMITTED',
        },
      });
      reportId = report.id;
      reportCache.set(cacheKey, reportId);
      reportCount++;
      console.log(`    WeeklyReport: ${data.memberName} / ${data.weekLabel} → ${reportId}`);
    }

    // sortOrder: 같은 report 내에서 순서
    const sortOrderMap = reportSortOrders.get(reportId) || 0;
    reportSortOrders.set(reportId, sortOrderMap + 1);

    // 기존 데이터가 있으면 중복 방지를 위해 삭제 후 재생성 대신 항상 create
    // (멱등성은 WeeklyReport upsert + WorkItem deleteMany + createMany 패턴 사용)
    await prisma.workItem.create({
      data: {
        weeklyReportId: reportId,
        projectId: data.projectId,
        doneWork: data.doneWork,
        planWork: data.planWork,
        remarks: data.remarks,
        sortOrder: sortOrderMap,
      },
    });
    itemCount++;
  }

  return { reportCount, itemCount, skippedRows };
}

// 행 데이터를 모을 배열 (eachRow 동기 콜백에서 수집 후 비동기 처리)
const weeklyRowData: Array<{
  memberId: string;
  weekStart: Date;
  weekLabel: string;
  projectId: string | null;
  doneWork: string;
  planWork: string;
  remarks: string | null;
  memberName: string;
  rowIdx: number;
}> = [];

const reportSortOrders = new Map<string, number>();

// ──────────── TASK-02: PartSummary + SummaryWorkItem 시드 ────────────
async function seedPartSummaries(
  wb: ExcelJS.Workbook,
  partMap: Map<string, string>,
  projectMap: Map<string, string>,
): Promise<{ summaryCount: number; summaryItemCount: number }> {
  let summaryCount = 0;
  let summaryItemCount = 0;

  for (const [sheetName, { partName, weekLabel, weekStart }] of Object.entries(PART_SUMMARY_SHEETS)) {
    const ws = wb.getWorksheet(sheetName);
    if (!ws) {
      console.warn(`  [경고] 파트취합 시트 "${sheetName}" 없음 — 건너뜀`);
      continue;
    }

    const partId = partMap.get(partName);
    if (!partId) {
      console.warn(`  [경고] 파트 미매핑: "${partName}" — 시트 ${sheetName} 건너뜀`);
      continue;
    }

    console.log(`\n  [파트취합 시트] ${sheetName} (${weekLabel}, 파트: ${partName}) 처리 중...`);

    // PartSummary upsert
    const partSummary = await prisma.partSummary.upsert({
      where: {
        partId_weekStart: { partId, weekStart },
      },
      update: { status: 'SUBMITTED', weekLabel },
      create: {
        partId,
        weekStart,
        weekLabel,
        status: 'SUBMITTED',
      },
    });
    summaryCount++;
    console.log(`    PartSummary: ${partName} / ${weekLabel} → ${partSummary.id}`);

    // 기존 SummaryWorkItem 삭제 (멱등성)
    await prisma.summaryWorkItem.deleteMany({
      where: { partSummaryId: partSummary.id },
    });

    // 행 데이터 수집
    const rowDataList: Array<{
      projectId: string;
      doneWork: string;
      planWork: string;
      remarks: string | null;
      sortOrder: number;
    }> = [];

    let sortOrder = 0;
    ws.eachRow((row, idx) => {
      if (idx === 1) return; // 헤더 스킵

      const projectName = getCellText(row.getCell(1));
      if (!projectName) return; // 프로젝트명 없으면 스킵

      const projectId = projectMap.get(projectName);
      if (!projectId) {
        console.warn(`    [경고] 파트취합 프로젝트 미매핑: "${projectName}" — 행 ${idx} 건너뜀`);
        return;
      }

      const doneWork = getCellText(row.getCell(3));
      const planWork = getCellText(row.getCell(4));
      const remarks = getCellText(row.getCell(5));

      if (!doneWork && !planWork) return; // 빈 행 스킵

      rowDataList.push({
        projectId,
        doneWork,
        planWork,
        remarks: remarks || null,
        sortOrder: sortOrder++,
      });
    });

    // SummaryWorkItem 생성
    for (const item of rowDataList) {
      await prisma.summaryWorkItem.create({
        data: {
          partSummaryId: partSummary.id,
          projectId: item.projectId,
          doneWork: item.doneWork,
          planWork: item.planWork,
          remarks: item.remarks,
          sortOrder: item.sortOrder,
        },
      });
      summaryItemCount++;
    }

    console.log(`    SummaryWorkItem: ${rowDataList.length}건 생성`);
  }

  return { summaryCount, summaryItemCount };
}

// ──────────── 멱등성: WeeklyReport 기존 데이터 삭제 ────────────
async function clearExistingWeeklyData(
  memberMap: Map<string, string>,
  weekStarts: Date[],
): Promise<void> {
  const memberIds = [...memberMap.values()];

  // 해당 주차의 기존 WeeklyReport(+ cascade WorkItem) 삭제
  const existing = await prisma.weeklyReport.findMany({
    where: {
      memberId: { in: memberIds },
      weekStart: { in: weekStarts },
    },
    select: { id: true, weekLabel: true },
  });

  if (existing.length > 0) {
    console.log(`\n  [멱등성] 기존 WeeklyReport ${existing.length}건 삭제 후 재생성`);
    await prisma.weeklyReport.deleteMany({
      where: { id: { in: existing.map((r) => r.id) } },
    });
  }
}

// ──────────── 데이터 정합성 요약 출력 ────────────
async function printSummary(): Promise<void> {
  const reportCount = await prisma.weeklyReport.count();
  const itemCount = await prisma.workItem.count();
  const summaryCount = await prisma.partSummary.count();
  const summaryItemCount = await prisma.summaryWorkItem.count();

  console.log('\n========================================');
  console.log('  데이터 정합성 검증 요약');
  console.log('========================================');
  console.log(`  WeeklyReport    : ${reportCount}건`);
  console.log(`  WorkItem        : ${itemCount}건`);
  console.log(`  PartSummary     : ${summaryCount}건`);
  console.log(`  SummaryWorkItem : ${summaryItemCount}건`);
  console.log('========================================\n');

  // 팀원별 주차별 현황
  const reports = await prisma.weeklyReport.findMany({
    include: {
      member: { select: { name: true } },
      workItems: { select: { id: true } },
    },
    orderBy: [{ weekStart: 'asc' }, { member: { name: 'asc' } }],
  });

  console.log('  팀원별 주차별 현황:');
  for (const r of reports) {
    console.log(`    ${r.weekLabel} | ${r.member.name.padEnd(6)} | WorkItem ${r.workItems.length}건 | ${r.status}`);
  }
  console.log('');
}

// ──────────── 메인 ────────────
async function main() {
  console.log('========================================');
  console.log('  Excel 주간업무 데이터 시드 시작');
  console.log(`  파일: ${EXCEL_FILE}`);
  console.log('========================================\n');

  // Excel 파일 로드
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(EXCEL_FILE);
  console.log(`Excel 파일 로드 완료. 시트 수: ${wb.worksheets.length}`);

  // DB에서 Member, Project, Part 목록 조회
  const members = await prisma.member.findMany({ where: { isActive: true }, select: { id: true, name: true } });
  const projects = await prisma.project.findMany({ select: { id: true, name: true } });
  const parts = await prisma.part.findMany({ select: { id: true, name: true } });

  const memberMap = new Map<string, string>(members.map((m) => [m.name, m.id]));
  const projectMap = new Map<string, string>(projects.map((p) => [p.name, p.id]));
  const partMap = new Map<string, string>(parts.map((p) => [p.name, p.id]));

  console.log(`DB 조회: 팀원 ${members.length}명, 프로젝트 ${projects.length}개, 파트 ${parts.length}개`);

  // 멱등성: 기존 WeeklyReport 삭제
  const weekStarts = Object.values(WEEKLY_SHEET_MAP).map((v) => v.weekStart);
  await clearExistingWeeklyData(memberMap, weekStarts);

  // TASK-01: WeeklyReport + WorkItem 시드
  console.log('\n[TASK-01] WeeklyReport + WorkItem 시드 시작...');
  const { reportCount, itemCount, skippedRows } = await seedWeeklyReports(wb, memberMap, projectMap);
  console.log(`\n  완료: WeeklyReport ${reportCount}건, WorkItem ${itemCount}건, 건너뜀 ${skippedRows}행`);

  // TASK-02: PartSummary + SummaryWorkItem 시드
  console.log('\n[TASK-02] PartSummary + SummaryWorkItem 시드 시작...');
  const { summaryCount, summaryItemCount } = await seedPartSummaries(wb, partMap, projectMap);
  console.log(`\n  완료: PartSummary ${summaryCount}건, SummaryWorkItem ${summaryItemCount}건`);

  // 데이터 정합성 요약 출력
  await printSummary();

  console.log('시드 완료!');
}

main()
  .catch((e) => {
    console.error('시드 실행 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
