/*
  Warnings:

  - You are about to drop the column `description` on the `Case` table. All the data in the column will be lost.
  - Added the required column `fullDescription` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortDescription` to the `Case` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CasePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "Case" DROP COLUMN "description",
ADD COLUMN     "fullDescription" TEXT NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "priority" "CasePriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "shortDescription" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Case_priority_idx" ON "Case"("priority");

-- CreateIndex
CREATE INDEX "Case_location_idx" ON "Case"("location");
