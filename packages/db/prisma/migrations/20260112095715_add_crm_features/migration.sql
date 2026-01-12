-- CreateTable
CREATE TABLE "LeadNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadNote_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryProblem" TEXT,
    "primaryType" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "rating" REAL,
    "userRatingCount" INTEGER,
    "websiteUrl" TEXT,
    "googleMapsUrl" TEXT,
    "lat" REAL,
    "lng" REAL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Place" ("address", "createdAt", "googleMapsUrl", "id", "lat", "lng", "name", "phone", "placeId", "primaryProblem", "primaryType", "rating", "updatedAt", "userRatingCount", "websiteUrl") SELECT "address", "createdAt", "googleMapsUrl", "id", "lat", "lng", "name", "phone", "placeId", "primaryProblem", "primaryType", "rating", "updatedAt", "userRatingCount", "websiteUrl" FROM "Place";
DROP TABLE "Place";
ALTER TABLE "new_Place" RENAME TO "Place";
CREATE UNIQUE INDEX "Place_placeId_key" ON "Place"("placeId");
CREATE INDEX "Place_placeId_idx" ON "Place"("placeId");
CREATE INDEX "Place_rating_userRatingCount_idx" ON "Place"("rating", "userRatingCount");
CREATE INDEX "Place_status_idx" ON "Place"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "LeadNote_placeId_idx" ON "LeadNote"("placeId");
