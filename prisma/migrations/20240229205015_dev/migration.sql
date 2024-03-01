/*
  Warnings:

  - You are about to drop the column `oauthConfigId` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `smtpConfigId` on the `Email` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Email" DROP COLUMN "oauthConfigId",
DROP COLUMN "smtpConfigId";
