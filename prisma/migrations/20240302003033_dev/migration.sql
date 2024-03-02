-- CreateTable
CREATE TABLE "OAuthApp" (
    "id" UUID NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "type" "OAuthProvider" NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "OAuthApp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OAuthApp_organizationId_type_key" ON "OAuthApp"("organizationId", "type");

-- AddForeignKey
ALTER TABLE "OAuthApp" ADD CONSTRAINT "OAuthApp_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
