-- DropIndex
DROP INDEX "users_googleId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "googleId",
ADD COLUMN "passwordHash" TEXT NOT NULL;
