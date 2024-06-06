/*
  Warnings:

  - A unique constraint covering the columns `[emailTemplateId,name]` on the table `VariableDefinition` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "VariableDefinition_emailTemplateId_name_key" ON "VariableDefinition"("emailTemplateId", "name");
