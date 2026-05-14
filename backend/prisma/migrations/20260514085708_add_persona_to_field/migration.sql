/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "persona" VARCHAR(20),
DROP COLUMN "role",
ADD COLUMN     "role" "Role"[] DEFAULT ARRAY['user']::"Role"[];
