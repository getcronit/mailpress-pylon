-- DropForeignKey
ALTER TABLE "EmailEnvelope" DROP CONSTRAINT "EmailEnvelope_emailTemplateId_fkey";

-- AddForeignKey
ALTER TABLE "EmailEnvelope" ADD CONSTRAINT "EmailEnvelope_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES "EmailTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
