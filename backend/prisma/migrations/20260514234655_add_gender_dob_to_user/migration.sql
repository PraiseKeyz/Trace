/*
  Warnings:

  - The `status` column on the `opportunity_applications` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OpportunityApplicationStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- AlterTable
ALTER TABLE "opportunities" ADD COLUMN     "auto_release_at" TIMESTAMP(3),
ADD COLUMN     "escrow_amount" DECIMAL(15,2),
ADD COLUMN     "funds_locked_at" TIMESTAMP(3),
ADD COLUMN     "worker_done_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "opportunity_applications" ADD COLUMN     "cover_note" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "OpportunityApplicationStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dob" VARCHAR(10),
ADD COLUMN     "gender" VARCHAR(10);
