-- CreateEnum
DO $$
BEGIN
  CREATE TYPE "OpportunityApplicationStatus" AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "opportunities" ADD COLUMN IF NOT EXISTS "auto_release_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "escrow_amount" DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS "funds_locked_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "worker_done_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "opportunity_applications" ADD COLUMN IF NOT EXISTS "cover_note" TEXT,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "OpportunityApplicationStatus"
  USING COALESCE("status", 'pending')::"OpportunityApplicationStatus",
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "dob" VARCHAR(10),
ADD COLUMN IF NOT EXISTS "gender" VARCHAR(10);
