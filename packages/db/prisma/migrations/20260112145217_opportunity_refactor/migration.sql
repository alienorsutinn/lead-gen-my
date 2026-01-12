/*
  Warnings:

  - You are about to drop the `LeadNote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeadOpsRecommendation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LeadScore` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LeadNote";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LeadOpsRecommendation";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LeadScore";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "tier" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "freshness" TEXT NOT NULL,
    "breakdown" TEXT,
    "computedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Opportunity_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Note_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OpsRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "visibilityScore" INTEGER NOT NULL,
    "conversionScore" INTEGER NOT NULL,
    "opsScore" INTEGER NOT NULL,
    "offerType" TEXT NOT NULL,
    "reasons" TEXT,
    "actions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OpsRecommendation_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Opportunity_placeId_idx" ON "Opportunity"("placeId");

-- CreateIndex
CREATE INDEX "Opportunity_computedAt_idx" ON "Opportunity"("computedAt");

-- CreateIndex
CREATE INDEX "Opportunity_score_idx" ON "Opportunity"("score");

-- CreateIndex
CREATE INDEX "Note_placeId_idx" ON "Note"("placeId");

-- CreateIndex
CREATE INDEX "OpsRecommendation_placeId_idx" ON "OpsRecommendation"("placeId");
