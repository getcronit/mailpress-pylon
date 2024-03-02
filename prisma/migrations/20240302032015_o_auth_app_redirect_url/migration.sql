/*
  Warnings:

  - Added the required column `redirectUrl` to the `OAuthApp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OAuthApp" ADD COLUMN     "redirectUrl" TEXT NOT NULL;
