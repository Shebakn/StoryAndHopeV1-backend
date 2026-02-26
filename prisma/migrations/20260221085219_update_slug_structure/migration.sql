/*
  Warnings:

  - You are about to drop the column `slug` on the `Case` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Case_slug_key";

-- AlterTable
ALTER TABLE "Case" DROP COLUMN "slug";
