-- CreateEnum
CREATE TYPE "ResumeAnalysisStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'DELETED');

-- CreateTable
CREATE TABLE "resume_analyses" (
    "id" UUID NOT NULL,
    "resume_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "prompt_version" TEXT NOT NULL,
    "status" "ResumeAnalysisStatus" NOT NULL DEFAULT 'QUEUED',
    "ats_score" INTEGER,
    "overall_score" INTEGER,
    "job_fit_score" INTEGER,
    "summary" TEXT,
    "report_json" JSONB,
    "word_count" INTEGER,
    "page_count" INTEGER,
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "error_code" TEXT,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resume_analyses_resume_id_created_at_idx" ON "resume_analyses"("resume_id", "created_at");

-- CreateIndex
CREATE INDEX "resume_analyses_status_created_at_idx" ON "resume_analyses"("status", "created_at");

-- AddForeignKey
ALTER TABLE "resume_analyses" ADD CONSTRAINT "resume_analyses_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
