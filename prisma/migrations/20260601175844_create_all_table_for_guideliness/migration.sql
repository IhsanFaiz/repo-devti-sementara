-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "applicantId" INTEGER NOT NULL,
    "jobDeskId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "startWorking" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "previousPosition" TEXT,
    "currentPosition" TEXT,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applicant" (
    "id" SERIAL NOT NULL,
    "jobOpeningId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "placeOfBirth" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "domicile" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "administration" TEXT,
    "writtenTest" TEXT,
    "interview" TEXT,
    "miniProject" TEXT,
    "administrationScore" INTEGER,
    "writtenTestScore" INTEGER,
    "interviewScore" INTEGER,
    "miniProjectScore" INTEGER,
    "result" TEXT,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobDesk" (
    "id" SERIAL NOT NULL,
    "jobDeskName" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "JobDesk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOpening" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "jobOpeningPeriod" TEXT NOT NULL,

    CONSTRAINT "JobOpening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobDeskModul" (
    "id" SERIAL NOT NULL,
    "jobDeskId" INTEGER NOT NULL,
    "modulId" INTEGER NOT NULL,

    CONSTRAINT "JobDeskModul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModulOnboarding" (
    "id" SERIAL NOT NULL,
    "modulName" TEXT NOT NULL,
    "groupChecklist" TEXT NOT NULL,
    "listChecklist" TEXT NOT NULL,
    "sourceInformation" TEXT,

    CONSTRAINT "ModulOnboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "teamName" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamProject" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "TeamProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingProgres" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "modulId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "OnboardingProgres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskList" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "taskName" TEXT NOT NULL,
    "taskStatus" TEXT NOT NULL DEFAULT 'To Do',

    CONSTRAINT "TaskList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "documentType" TEXT NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantDocument" (
    "id" SERIAL NOT NULL,
    "applicantId" INTEGER NOT NULL,
    "documentId" INTEGER NOT NULL,

    CONSTRAINT "ApplicantDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_jobDeskId_fkey" FOREIGN KEY ("jobDeskId") REFERENCES "JobDesk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_jobOpeningId_fkey" FOREIGN KEY ("jobOpeningId") REFERENCES "JobOpening"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDeskModul" ADD CONSTRAINT "JobDeskModul_jobDeskId_fkey" FOREIGN KEY ("jobDeskId") REFERENCES "JobDesk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDeskModul" ADD CONSTRAINT "JobDeskModul_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "ModulOnboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamProject" ADD CONSTRAINT "TeamProject_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamProject" ADD CONSTRAINT "TeamProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingProgres" ADD CONSTRAINT "OnboardingProgres_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingProgres" ADD CONSTRAINT "OnboardingProgres_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "ModulOnboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskList" ADD CONSTRAINT "TaskList_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskList" ADD CONSTRAINT "TaskList_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantDocument" ADD CONSTRAINT "ApplicantDocument_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantDocument" ADD CONSTRAINT "ApplicantDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
