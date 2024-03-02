/*
  Warnings:

  - Added the required column `accessTokenExpiresAt` to the `OAuthConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `OAuthConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OAuthConfig" ADD COLUMN     "accessTokenExpiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "refreshToken" TEXT NOT NULL;
