/*
  Warnings:

  - You are about to drop the column `listStatus` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullname" TEXT,
    "nickname" TEXT,
    "birthdate" DATETIME,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "roleAssignedAt" DATETIME,
    "phone" TEXT,
    "country" TEXT,
    "city" TEXT,
    "district" TEXT,
    "address" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "banUntil" DATETIME,
    "banType" TEXT,
    "bannedIp" TEXT,
    "isAddressVerified" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("address", "avatarUrl", "balance", "banReason", "banType", "banUntil", "bannedIp", "bio", "birthdate", "city", "country", "createdAt", "district", "email", "fullname", "id", "isBanned", "nickname", "password", "phone", "role", "roleAssignedAt", "updatedAt") SELECT "address", "avatarUrl", "balance", "banReason", "banType", "banUntil", "bannedIp", "bio", "birthdate", "city", "country", "createdAt", "district", "email", "fullname", "id", "isBanned", "nickname", "password", "phone", "role", "roleAssignedAt", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
