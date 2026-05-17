-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "host" TEXT NOT NULL,
    "attendees" TEXT NOT NULL,
    "link" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'other',
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "agenda" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Meeting" ("agenda", "attendees", "createdAt", "date", "duration", "endTime", "host", "id", "link", "platform", "startTime", "status", "title", "updatedAt") SELECT "agenda", "attendees", "createdAt", "date", "duration", "endTime", "host", "id", "link", "platform", "startTime", "status", "title", "updatedAt" FROM "Meeting";
DROP TABLE "Meeting";
ALTER TABLE "new_Meeting" RENAME TO "Meeting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
