/*
  Warnings:

  - You are about to drop the `ProjectSubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectSubmissionValue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectSubmission" DROP CONSTRAINT "ProjectSubmission_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectSubmission" DROP CONSTRAINT "ProjectSubmission_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectSubmissionValue" DROP CONSTRAINT "ProjectSubmissionValue_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectSubmissionValue" DROP CONSTRAINT "ProjectSubmissionValue_fileId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectSubmissionValue" DROP CONSTRAINT "ProjectSubmissionValue_submissionId_fkey";

-- DropTable
DROP TABLE "ProjectSubmission";

-- DropTable
DROP TABLE "ProjectSubmissionValue";

-- CreateTable
CREATE TABLE "ProjectFieldValue" (
    "id" SERIAL NOT NULL,
    "fieldId" INTEGER NOT NULL,
    "value" TEXT,
    "fileId" INTEGER,
    "submittedBy" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectFieldValue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectFieldValue" ADD CONSTRAINT "ProjectFieldValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "ProjectField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFieldValue" ADD CONSTRAINT "ProjectFieldValue_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "ProjectFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFieldValue" ADD CONSTRAINT "ProjectFieldValue_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
