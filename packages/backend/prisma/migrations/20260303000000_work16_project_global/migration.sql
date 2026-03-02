-- WORK-16: Project 전역화 + TeamProject 연결 테이블 신설 + ProjectStatus enum 변경
-- PostgreSQL에서 enum 값을 같은 트랜잭션에서 사용할 수 없으므로,
-- 새로운 enum 타입을 직접 생성하는 방식으로 처리한다.

-- 1. 새로운 ProjectStatus enum 타입 생성 (ACTIVE, INACTIVE만)
CREATE TYPE "ProjectStatus_new" AS ENUM ('ACTIVE', 'INACTIVE');

-- 2. projects 테이블의 status 컬럼을 새 타입으로 변환
--    HOLD, COMPLETED → INACTIVE로 매핑
ALTER TABLE "projects"
    ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "projects"
    ALTER COLUMN "status" TYPE "ProjectStatus_new"
    USING (
        CASE "status"::text
            WHEN 'ACTIVE' THEN 'ACTIVE'::"ProjectStatus_new"
            ELSE 'INACTIVE'::"ProjectStatus_new"
        END
    );

ALTER TABLE "projects"
    ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"ProjectStatus_new";

-- 3. 기존 ProjectStatus enum 제거 후 새 타입으로 이름 변경
DROP TYPE "ProjectStatus";
ALTER TYPE "ProjectStatus_new" RENAME TO "ProjectStatus";

-- 4. team_projects 연결 테이블 생성
CREATE TABLE "team_projects" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_projects_pkey" PRIMARY KEY ("id")
);

-- 5. 기존 projects 테이블의 teamId 데이터를 team_projects로 이전
INSERT INTO "team_projects" ("id", "teamId", "projectId", "sortOrder", "createdAt")
SELECT
    gen_random_uuid()::text,
    p."teamId",
    p."id",
    p."sortOrder",
    NOW()
FROM "projects" p
WHERE p."teamId" IS NOT NULL;

-- 6. team_projects 유니크 인덱스 추가
CREATE UNIQUE INDEX "team_projects_teamId_projectId_key" ON "team_projects"("teamId", "projectId");

-- 7. team_projects FK 추가
ALTER TABLE "team_projects" ADD CONSTRAINT "team_projects_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "team_projects" ADD CONSTRAINT "team_projects_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 8. projects 테이블에서 teamId FK 제약 제거
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_teamId_fkey";

-- 9. projects 테이블의 teamId_code 유니크 인덱스 제거
DROP INDEX IF EXISTS "projects_teamId_code_key";

-- 10. projects 테이블에서 teamId 컬럼 제거
ALTER TABLE "projects" DROP COLUMN IF EXISTS "teamId";

-- 11. projects 테이블에 code 전역 유니크 인덱스 추가
CREATE UNIQUE INDEX "projects_code_key" ON "projects"("code");
