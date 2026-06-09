-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('INTERESTED', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEWING', 'OFFER_RECEIVED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "JobInterviewType" AS ENUM ('RECRUITER_SCREEN', 'HIRING_MANAGER', 'TECHNICAL', 'BEHAVIORAL', 'GENERAL');

-- CreateEnum
CREATE TYPE "JobInterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "appliedAt" TIMESTAMP(3),
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'INTERESTED';

-- CreateTable
CREATE TABLE "job_interviews" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "JobInterviewType" NOT NULL DEFAULT 'GENERAL',
    "status" "JobInterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_interviews_userId_scheduledAt_idx" ON "job_interviews"("userId", "scheduledAt");

-- AddForeignKey
ALTER TABLE "job_interviews" ADD CONSTRAINT "job_interviews_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_interviews" ADD CONSTRAINT "job_interviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
