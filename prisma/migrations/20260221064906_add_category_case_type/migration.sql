/*
  Warnings:

  - Added the required column `caseTypeId` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "caseTypeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_caseTypeId_fkey" FOREIGN KEY ("caseTypeId") REFERENCES "CaseType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
