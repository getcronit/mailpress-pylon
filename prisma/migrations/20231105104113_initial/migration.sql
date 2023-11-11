-- CreateEnum
CREATE TYPE "EmailAddressType" AS ENUM ('EMAIL_ADDRESS', 'EMAIL_ID', 'USER_ID');

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "verifyReplyTo" BOOLEAN,
    "transformer" TEXT,
    "authorizationUserId" UUID NOT NULL,
    "envelopeId" UUID NOT NULL,
    "parentId" UUID,
    "createdBy" UUID,
    "resourceId" UUID,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariableDefinition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultValue" TEXT NOT NULL,
    "isRequired" BOOLEAN,
    "isConstant" BOOLEAN,
    "emailTemplateId" UUID,

    CONSTRAINT "VariableDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorizationUser" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "authorization" TEXT NOT NULL,

    CONSTRAINT "AuthorizationUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailEnvelope" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subject" TEXT,
    "fromId" UUID NOT NULL,
    "replyToId" UUID NOT NULL,

    CONSTRAINT "EmailEnvelope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailAddress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "value" TEXT NOT NULL,
    "type" "EmailAddressType" NOT NULL,

    CONSTRAINT "EmailAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmailAddressToEmailEnvelope" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EmailAddressToEmailEnvelope_AB_unique" ON "_EmailAddressToEmailEnvelope"("A", "B");

-- CreateIndex
CREATE INDEX "_EmailAddressToEmailEnvelope_B_index" ON "_EmailAddressToEmailEnvelope"("B");

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_authorizationUserId_fkey" FOREIGN KEY ("authorizationUserId") REFERENCES "AuthorizationUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_envelopeId_fkey" FOREIGN KEY ("envelopeId") REFERENCES "EmailEnvelope"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariableDefinition" ADD CONSTRAINT "VariableDefinition_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailEnvelope" ADD CONSTRAINT "EmailEnvelope_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "EmailAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailEnvelope" ADD CONSTRAINT "EmailEnvelope_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "EmailAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailAddressToEmailEnvelope" ADD CONSTRAINT "_EmailAddressToEmailEnvelope_A_fkey" FOREIGN KEY ("A") REFERENCES "EmailAddress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailAddressToEmailEnvelope" ADD CONSTRAINT "_EmailAddressToEmailEnvelope_B_fkey" FOREIGN KEY ("B") REFERENCES "EmailEnvelope"("id") ON DELETE CASCADE ON UPDATE CASCADE;
