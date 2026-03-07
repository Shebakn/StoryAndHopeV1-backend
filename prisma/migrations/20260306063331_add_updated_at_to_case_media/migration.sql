/*
  Warnings:

  - A unique constraint covering the columns `[caseId,order]` on the table `CaseMedia` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "DonationStatus" ADD VALUE 'SUCCESS';

-- DropIndex
DROP INDEX "CaseMedia_caseId_order_idx";

-- DropIndex
DROP INDEX "CaseMedia_publicId_idx";

-- AlterTable
ALTER TABLE "CaseMedia" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "uploadedById" TEXT,
ALTER COLUMN "publicId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "CaseMedia_uploadedById_idx" ON "CaseMedia"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "CaseMedia_caseId_order_key" ON "CaseMedia"("caseId", "order");

-- AddForeignKey
ALTER TABLE "CaseMedia" ADD CONSTRAINT "CaseMedia_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
