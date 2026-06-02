-- AlterTable
ALTER TABLE "Applicant" ALTER COLUMN "jobOpeningId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "applicantId" DROP NOT NULL,
ALTER COLUMN "jobDeskId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "JobDeskModul" ALTER COLUMN "jobDeskId" DROP NOT NULL,
ALTER COLUMN "modulId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OnboardingProgres" ALTER COLUMN "employeeId" DROP NOT NULL,
ALTER COLUMN "modulId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "dueDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TaskList" ALTER COLUMN "projectId" DROP NOT NULL,
ALTER COLUMN "employeeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TeamProject" ALTER COLUMN "teamId" DROP NOT NULL,
ALTER COLUMN "projectId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "references" TEXT NOT NULL,
    "via" TEXT,
    "psal" TEXT,
    "department" TEXT,
    "category" TEXT,
    "applicationName" TEXT,
    "framework" TEXT,
    "version" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "groupType" TEXT,
    "serviceType" TEXT,
    "subServiceType" TEXT,
    "priority" TEXT,
    "slaDays" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" INTEGER,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Request_projectId_key" ON "Request"("projectId");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
