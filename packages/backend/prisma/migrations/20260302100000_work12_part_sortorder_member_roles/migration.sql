-- AlterTable: Part에 sortOrder 추가
ALTER TABLE "parts" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: Member.role(단일) -> roles(배열) 변환
-- 1. roles 컬럼 추가 (enum 배열)
ALTER TABLE "members" ADD COLUMN "roles" "MemberRole"[] NOT NULL DEFAULT ARRAY['MEMBER'::"MemberRole"];

-- 2. 기존 role 값을 roles 배열로 복사
UPDATE "members" SET "roles" = ARRAY[role];

-- 3. 기존 role 컬럼 제거
ALTER TABLE "members" DROP COLUMN "role";
