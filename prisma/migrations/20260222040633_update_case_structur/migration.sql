/*
  Warnings:

  - A unique constraint covering the columns `[coverMediaId]` on the table `Case` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "coverMediaId" TEXT;

-- AlterTable
ALTER TABLE "CaseMedia" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Case_coverMediaId_key" ON "Case"("coverMediaId");

-- CreateIndex
CREATE INDEX "Case_coverMediaId_idx" ON "Case"("coverMediaId");

-- CreateIndex
CREATE INDEX "CaseMedia_caseId_order_idx" ON "CaseMedia"("caseId", "order");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "CaseMedia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
