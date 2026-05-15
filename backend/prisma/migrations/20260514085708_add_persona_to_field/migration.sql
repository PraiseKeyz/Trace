-- CreateEnum
DO $$
BEGIN
  CREATE TYPE "Role" AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "persona" VARCHAR(20),
ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "role" TYPE "Role"[]
  USING COALESCE("role", ARRAY[]::TEXT[])::"Role"[],
ALTER COLUMN "role" SET DEFAULT ARRAY['user']::"Role"[];
