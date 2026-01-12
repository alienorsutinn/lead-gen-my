-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryType" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "rating" REAL,
    "userRatingCount" INTEGER,
    "websiteUrl" TEXT,
    "googleMapsUrl" TEXT,
    "lat" REAL,
    "lng" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WebsiteCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "resolvedUrl" TEXT,
    "status" TEXT NOT NULL,
    "https" BOOLEAN NOT NULL DEFAULT false,
    "httpStatus" INTEGER,
    "errors" TEXT,
    "lastCheckedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebsiteCheck_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PsiAudit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "performance" INTEGER,
    "seo" INTEGER,
    "accessibility" INTEGER,
    "bestPractices" INTEGER,
    "rawJson" TEXT,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PsiAudit_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Screenshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "viewport" TEXT NOT NULL,
    "pngPath" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Screenshot_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LlmVerdict" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "url" TEXT,
    "needsIntervention" BOOLEAN NOT NULL DEFAULT false,
    "severity" TEXT,
    "reasons" TEXT,
    "quickWins" TEXT,
    "offerAngle" TEXT,
    "modelName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LlmVerdict_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeadScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "tier" TEXT NOT NULL,
    "breakdown" TEXT,
    "computedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadScore_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "meta" TEXT,
    "error" TEXT
);

-- CreateTable
CREATE TABLE "DailyUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "Place_placeId_key" ON "Place"("placeId");

-- CreateIndex
CREATE INDEX "Place_placeId_idx" ON "Place"("placeId");

-- CreateIndex
CREATE INDEX "Place_rating_userRatingCount_idx" ON "Place"("rating", "userRatingCount");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteCheck_placeId_key" ON "WebsiteCheck"("placeId");

-- CreateIndex
CREATE INDEX "WebsiteCheck_status_idx" ON "WebsiteCheck"("status");

-- CreateIndex
CREATE INDEX "PsiAudit_placeId_idx" ON "PsiAudit"("placeId");

-- CreateIndex
CREATE INDEX "Screenshot_placeId_idx" ON "Screenshot"("placeId");

-- CreateIndex
CREATE INDEX "LlmVerdict_placeId_idx" ON "LlmVerdict"("placeId");

-- CreateIndex
CREATE INDEX "LlmVerdict_needsIntervention_idx" ON "LlmVerdict"("needsIntervention");

-- CreateIndex
CREATE INDEX "LeadScore_placeId_idx" ON "LeadScore"("placeId");

-- CreateIndex
CREATE INDEX "LeadScore_computedAt_idx" ON "LeadScore"("computedAt");

-- CreateIndex
CREATE INDEX "LeadScore_score_idx" ON "LeadScore"("score");

-- CreateIndex
CREATE INDEX "JobRun_jobType_status_idx" ON "JobRun"("jobType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DailyUsage_date_metric_key" ON "DailyUsage"("date", "metric");
