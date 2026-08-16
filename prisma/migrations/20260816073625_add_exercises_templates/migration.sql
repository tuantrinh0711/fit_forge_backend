/*
  Warnings:

  - Added the required column `userId` to the `goals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `meals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `training_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `weight_entries` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `workouts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "workouts" DROP CONSTRAINT "workouts_userId_fkey";

-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "meals" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "training_plans" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "weight_entries" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "workouts" ALTER COLUMN "userId" SET NOT NULL;

-- CreateTable
CREATE TABLE "exercises_templates" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "tags" JSONB NOT NULL,

    CONSTRAINT "exercises_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "goals_userId_idx" ON "goals"("userId");

-- CreateIndex
CREATE INDEX "meals_userId_idx" ON "meals"("userId");

-- CreateIndex
CREATE INDEX "training_plans_userId_idx" ON "training_plans"("userId");

-- CreateIndex
CREATE INDEX "weight_entries_userId_idx" ON "weight_entries"("userId");

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_entries" ADD CONSTRAINT "weight_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plans" ADD CONSTRAINT "training_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
