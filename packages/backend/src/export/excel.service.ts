import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../prisma/prisma.service';
import { getWeekRange } from '../weekly-report/week-utils';
import { ExportQueryDto, ExportType } from './dto/export-query.dto';

@Injectable()
export class ExcelService {
  constructor(private prisma: PrismaService) {}

  async generateExcel(query: ExportQueryDto): Promise<{ buffer: Buffer; filename: string }> {
    if (query.type === ExportType.PART) {
      return this.generatePartExcel(query.partId!, query.week);
    }
    return this.generateTeamExcel(query.teamId!, query.week);
  }

  private async generatePartExcel(partId: string, week: string): Promise<{ buffer: Buffer; filename: string }> {
    const { start } = getWeekRange(week);

    const part = await this.prisma.part.findUnique({
      where: { id: partId },
      include: {
        members: {
          where: { isActive: true },
          include: {
            weeklyReports: {
              where: { weekStart: start },
              include: {
                workItems: {
                  include: { project: true },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('주간업무보고');

    this.setupHeaders(sheet);

    let rowIdx = 2;
    for (const member of part?.members ?? []) {
      const report = member.weeklyReports[0];
      const items = report?.workItems ?? [];

      if (items.length === 0) {
        const row = sheet.getRow(rowIdx);
        row.getCell(1).value = part?.name ?? '';
        row.getCell(2).value = member.name;
        row.getCell(3).value = '';
        row.getCell(4).value = '';
        row.getCell(5).value = '';
        row.getCell(6).value = '';
        row.getCell(7).value = '';
        row.commit();
        rowIdx++;
      } else {
        const startRow = rowIdx;
        for (const item of items) {
          const row = sheet.getRow(rowIdx);
          row.getCell(1).value = part?.name ?? '';
          row.getCell(2).value = member.name;
          row.getCell(3).value = item.project?.name ?? '';
          row.getCell(4).value = item.project?.code ?? '';
          row.getCell(5).value = item.doneWork;
          row.getCell(6).value = item.planWork;
          row.getCell(7).value = item.remarks ?? '';
          this.applyRowStyle(row);
          row.commit();
          rowIdx++;
        }
        // 파트·성명 셀 병합
        if (rowIdx - startRow > 1) {
          sheet.mergeCells(startRow, 1, rowIdx - 1, 1);
          sheet.mergeCells(startRow, 2, rowIdx - 1, 2);
        }
      }
    }

    this.applyBorderAll(sheet, rowIdx - 1);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    return { buffer, filename: `${part?.name ?? 'part'}_${week}.xlsx` };
  }

  private async generateTeamExcel(teamId: string, week: string): Promise<{ buffer: Buffer; filename: string }> {
    const { start } = getWeekRange(week);

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        parts: {
          include: {
            members: {
              where: { isActive: true },
              include: {
                weeklyReports: {
                  where: { weekStart: start },
                  include: {
                    workItems: {
                      include: { project: true },
                      orderBy: { sortOrder: 'asc' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('팀 주간업무보고');

    this.setupHeaders(sheet);

    let rowIdx = 2;
    for (const part of team?.parts ?? []) {
      for (const member of part.members) {
        const report = member.weeklyReports[0];
        const items = report?.workItems ?? [];

        if (items.length === 0) {
          const row = sheet.getRow(rowIdx);
          row.getCell(1).value = part.name;
          row.getCell(2).value = member.name;
          this.applyRowStyle(row);
          row.commit();
          rowIdx++;
        } else {
          const startRow = rowIdx;
          for (const item of items) {
            const row = sheet.getRow(rowIdx);
            row.getCell(1).value = part.name;
            row.getCell(2).value = member.name;
            row.getCell(3).value = item.project?.name ?? '';
            row.getCell(4).value = item.project?.code ?? '';
            row.getCell(5).value = item.doneWork;
            row.getCell(6).value = item.planWork;
            row.getCell(7).value = item.remarks ?? '';
            this.applyRowStyle(row);
            row.commit();
            rowIdx++;
          }
          if (rowIdx - startRow > 1) {
            sheet.mergeCells(startRow, 1, rowIdx - 1, 1);
            sheet.mergeCells(startRow, 2, rowIdx - 1, 2);
          }
        }
      }
    }

    this.applyBorderAll(sheet, rowIdx - 1);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    return { buffer, filename: `팀_주간업무보고_${week}.xlsx` };
  }

  private setupHeaders(sheet: ExcelJS.Worksheet): void {
    sheet.columns = [
      { header: '파트', key: 'part', width: 12 },
      { header: '성명', key: 'name', width: 10 },
      { header: '프로젝트명', key: 'projectName', width: 20 },
      { header: '코드', key: 'code', width: 15 },
      { header: '진행업무', key: 'doneWork', width: 40 },
      { header: '예정업무', key: 'planWork', width: 40 },
      { header: '비고', key: 'remarks', width: 20 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8E0FF' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });
    headerRow.height = 20;
  }

  private applyRowStyle(row: ExcelJS.Row): void {
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'top', wrapText: true };
    });
    row.height = 60;
  }

  private applyBorderAll(sheet: ExcelJS.Worksheet, lastRow: number): void {
    for (let r = 2; r <= lastRow; r++) {
      sheet.getRow(r).eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }
  }
}
