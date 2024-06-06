/*
  Warnings:

  - You are about to drop the column `redirectUrl` on the `OAuthApp` table. All the data in the column will be lost.
  - Added the required column `redirectUrl` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OAuthApp" DROP COLUMN "redirectUrl";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "redirectUrl" TEXT NOT NULL;
