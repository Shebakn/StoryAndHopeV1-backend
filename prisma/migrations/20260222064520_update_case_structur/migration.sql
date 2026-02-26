-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "beneficiaryAge" INTEGER,
ADD COLUMN     "beneficiaryName" TEXT,
ADD COLUMN     "beneficiaryStory" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "goals" TEXT[],
ADD COLUMN     "startDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Case_startDate_idx" ON "Case"("startDate");

-- CreateIndex
CREATE INDEX "Case_endDate_idx" ON "Case"("endDate");
