/*
  Warnings:

  - The primary key for the `exercises_templates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `exercises_templates` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- Drop and recreate table to ensure serial primary key reset
DROP TABLE IF EXISTS "exercises_templates";

CREATE TABLE "exercises_templates" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "tags" JSONB NOT NULL DEFAULT '[]'
);
