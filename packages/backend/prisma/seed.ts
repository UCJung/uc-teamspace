import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'password123';

async function main() {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // 0. ADMIN 계정 생성
  const admin = await prisma.member.upsert({
    where: { email: 'admin@system.local' },
    update: { name: '시스템관리자', roles: { set: ['ADMIN'] } },
    create: {
      name: '시스템관리자',
      email: 'admin@system.local',
      password: hashedPassword,
      roles: ['ADMIN'],
      accountStatus: 'ACTIVE',
      mustChangePassword: false,
      isActive: true,
    },
  });
  console.log(`ADMIN 생성: ${admin.name} (${admin.email})`);

  // 1. 팀 생성
  const team = await prisma.team.upsert({
    where: { name: '선행연구개발팀' },
    update: {},
    create: {
      name: '선행연구개발팀',
      description: '선행연구개발팀 주간업무보고 시스템',
      teamStatus: 'ACTIVE',
    },
  });
  console.log(`팀 생성: ${team.name} (${team.id})`);

  // 2. 파트 생성
  const dxPart = await prisma.part.upsert({
    where: { teamId_name: { teamId: team.id, name: 'DX' } },
    update: {},
    create: { name: 'DX', teamId: team.id },
  });

  const axPart = await prisma.part.upsert({
    where: { teamId_name: { teamId: team.id, name: 'AX' } },
    update: {},
    create: { name: 'AX', teamId: team.id },
  });
  console.log(`파트 생성: DX (${dxPart.id}), AX (${axPart.id})`);

  // 3. 팀원 생성
  const members = [
    // DX 파트
    { name: '홍길동', email: 'leader@example.com', roles: ['LEADER'] as const, partId: dxPart.id, sortOrder: 0 },
    { name: '김철수', email: 'dx.member1@example.com', roles: ['MEMBER'] as const, partId: dxPart.id, sortOrder: 1 },
    { name: '이영희', email: 'dx.member2@example.com', roles: ['MEMBER'] as const, partId: dxPart.id, sortOrder: 2 },
    { name: '박민수', email: 'dx.member3@example.com', roles: ['MEMBER'] as const, partId: dxPart.id, sortOrder: 3 },
    // AX 파트
    { name: '최수진', email: 'ax.partleader@example.com', roles: ['PART_LEADER'] as const, partId: axPart.id, sortOrder: 4 },
    { name: '정하늘', email: 'ax.member1@example.com', roles: ['MEMBER'] as const, partId: axPart.id, sortOrder: 5 },
    { name: '강서연', email: 'ax.member2@example.com', roles: ['MEMBER'] as const, partId: axPart.id, sortOrder: 6 },
    { name: '윤도현', email: 'ax.member3@example.com', roles: ['MEMBER'] as const, partId: axPart.id, sortOrder: 7 },
    { name: '한지우', email: 'ax.member4@example.com', roles: ['MEMBER'] as const, partId: axPart.id, sortOrder: 8 },
  ];

  for (const m of members) {
    const member = await prisma.member.upsert({
      where: { email: m.email },
      update: { name: m.name, roles: { set: m.roles }, partId: m.partId, sortOrder: m.sortOrder },
      create: {
        name: m.name,
        email: m.email,
        password: hashedPassword,
        roles: m.roles,
        partId: m.partId,
        sortOrder: m.sortOrder,
        accountStatus: 'ACTIVE',
        mustChangePassword: false,
      },
    });
    console.log(`팀원 생성: ${member.name} (${member.roles.join(', ')}) - ${member.email}`);

    // TeamMembership 생성
    await prisma.teamMembership.upsert({
      where: { memberId_teamId: { memberId: member.id, teamId: team.id } },
      update: { partId: m.partId, roles: { set: m.roles }, sortOrder: m.sortOrder },
      create: {
        memberId: member.id,
        teamId: team.id,
        partId: m.partId,
        roles: m.roles,
        sortOrder: m.sortOrder,
      },
    });
  }

  // 4. 프로젝트 생성
  const projects = [
    // 공통업무
    { name: '팀공통', code: '공통2500-팀', category: 'COMMON' as const },
    { name: 'DX공통', code: '공통2500-DX', category: 'COMMON' as const },
    { name: 'AX공통', code: '공통2500-AX', category: 'COMMON' as const },
    // 수행과제
    { name: '5G 1세부(현장수요)', code: '과제0013', category: 'EXECUTION' as const },
    { name: '5G 3세부(재난현장)', code: '과제0014', category: 'EXECUTION' as const },
    { name: '가상병원용인', code: '과제0023', category: 'EXECUTION' as const },
    { name: '비대면과제', code: '과제0024', category: 'EXECUTION' as const },
    { name: '스케일업팁스일산', code: '과제0026', category: 'EXECUTION' as const },
    { name: '질병관리청 AX', code: '과제0027', category: 'EXECUTION' as const },
    { name: '가상병원_한림(2025년)', code: 'HAX-의료-25004', category: 'EXECUTION' as const },
    { name: 'AI영상검사', code: '과제0011', category: 'EXECUTION' as const },
  ];

  for (const p of projects) {
    const project = await prisma.project.upsert({
      where: { teamId_code: { teamId: team.id, code: p.code } },
      update: { name: p.name, category: p.category },
      create: {
        name: p.name,
        code: p.code,
        category: p.category,
        teamId: team.id,
      },
    });
    console.log(`프로젝트 생성: ${project.name} (${project.code}) [${project.category}]`);
  }

  console.log('\n시드 데이터 생성 완료!');
}

main()
  .catch((e) => {
    console.error('시드 실행 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
