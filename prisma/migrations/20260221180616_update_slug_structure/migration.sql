/*
  Warnings:

  - Added the required column `publicId` to the `CaseMedia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CaseMedia" ADD COLUMN     "bytes" INTEGER,
ADD COLUMN     "format" TEXT,
ADD COLUMN     "publicId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "CaseMedia_publicId_idx" ON "CaseMedia"("publicId");
