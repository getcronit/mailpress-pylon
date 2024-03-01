-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE', 'AZURE');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "emailId" UUID,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" UUID NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "email" TEXT NOT NULL,
    "smtpConfigId" TEXT,
    "oauthConfigId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SMTPConfig" (
    "id" UUID NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "secure" BOOLEAN NOT NULL,
    "emailId" UUID NOT NULL,

    CONSTRAINT "SMTPConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthConfig" (
    "id" UUID NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "emailId" UUID NOT NULL,

    CONSTRAINT "OAuthConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "verifyReplyTo" BOOLEAN,
    "transformer" TEXT,
    "envelopeId" TEXT,
    "parentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariableDefinition" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultValue" TEXT,
    "isRequired" BOOLEAN,
    "isConstant" BOOLEAN,
    "emailTemplateId" UUID,

    CONSTRAINT "VariableDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailEnvelope" (
    "id" UUID NOT NULL,
    "subject" TEXT,
    "to" TEXT[],
    "replyTo" TEXT,
    "emailTemplateId" UUID NOT NULL,

    CONSTRAINT "EmailEnvelope_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_emailId_key" ON "Organization"("emailId");

-- CreateIndex
CREATE UNIQUE INDEX "Email_userId_key" ON "Email"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SMTPConfig_emailId_key" ON "SMTPConfig"("emailId");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthConfig_emailId_key" ON "OAuthConfig"("emailId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailEnvelope_emailTemplateId_key" ON "EmailEnvelope"("emailTemplateId");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SMTPConfig" ADD CONSTRAINT "SMTPConfig_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthConfig" ADD CONSTRAINT "OAuthConfig_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariableDefinition" ADD CONSTRAINT "VariableDefinition_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES "EmailTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailEnvelope" ADD CONSTRAINT "EmailEnvelope_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES "EmailTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
