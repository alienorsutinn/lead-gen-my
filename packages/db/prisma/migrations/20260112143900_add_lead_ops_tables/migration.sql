-- CreateTable
CREATE TABLE "UxAudit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "finalUrl" TEXT,
    "viewport" TEXT NOT NULL,
    "ttcAboveFoldMs" INTEGER,
    "clicksToContact" INTEGER,
    "contactMethods" TEXT,
    "blockers" TEXT,
    "evidencePngPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UxAudit_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompetitorBenchmark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "radiusKm" REAL NOT NULL,
    "competitors" TEXT,
    "stats" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompetitorBenchmark_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeadOpsRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "visibilityScore" INTEGER NOT NULL,
    "conversionScore" INTEGER NOT NULL,
    "opsScore" INTEGER NOT NULL,
    "offerType" TEXT NOT NULL,
    "reasons" TEXT,
    "actions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadOpsRecommendation_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UxAudit_placeId_idx" ON "UxAudit"("placeId");

-- CreateIndex
CREATE INDEX "CompetitorBenchmark_placeId_idx" ON "CompetitorBenchmark"("placeId");

-- CreateIndex
CREATE INDEX "LeadOpsRecommendation_placeId_idx" ON "LeadOpsRecommendation"("placeId");
