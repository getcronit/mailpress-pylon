/*
  Warnings:

  - Made the column `createdBy` on table `EmailTemplate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `resourceId` on table `EmailTemplate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "EmailTemplate" ALTER COLUMN "createdBy" SET NOT NULL,
ALTER COLUMN "resourceId" SET NOT NULL;
