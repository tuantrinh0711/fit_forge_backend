/*
  Warnings:

  - You are about to drop the `exercises_templates` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `exerciseId` on the `workout_exercises` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "workout_exercises" DROP COLUMN "exerciseId",
ADD COLUMN     "exerciseId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "exercises_templates";

-- CreateTable
CREATE TABLE "exercises" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tags" JSONB NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
