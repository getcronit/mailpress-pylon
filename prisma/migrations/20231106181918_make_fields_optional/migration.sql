/*
  Warnings:

  - Made the column `createdAt` on table `EmailTemplate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `EmailTemplate` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "EmailEnvelope" DROP CONSTRAINT "EmailEnvelope_fromId_fkey";

-- DropForeignKey
ALTER TABLE "EmailEnvelope" DROP CONSTRAINT "EmailEnvelope_replyToId_fkey";

-- DropForeignKey
ALTER TABLE "EmailTemplate" DROP CONSTRAINT "EmailTemplate_authorizationUserId_fkey";

-- DropForeignKey
ALTER TABLE "EmailTemplate" DROP CONSTRAINT "EmailTemplate_envelopeId_fkey";

-- AlterTable
ALTER TABLE "EmailEnvelope" ALTER COLUMN "fromId" DROP NOT NULL,
ALTER COLUMN "replyToId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "EmailTemplate" ALTER COLUMN "authorizationUserId" DROP NOT NULL,
ALTER COLUMN "envelopeId" DROP NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_authorizationUserId_fkey" FOREIGN KEY ("authorizationUserId") REFERENCES "AuthorizationUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_envelopeId_fkey" FOREIGN KEY ("envelopeId") REFERENCES "EmailEnvelope"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailEnvelope" ADD CONSTRAINT "EmailEnvelope_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "EmailAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailEnvelope" ADD CONSTRAINT "EmailEnvelope_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "EmailAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;
