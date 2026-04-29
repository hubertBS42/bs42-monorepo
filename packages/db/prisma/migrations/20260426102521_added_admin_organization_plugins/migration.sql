-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OrganizationPlan" AS ENUM ('BASIC', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" UUID NOT NULL,
    "impersonatedBy" TEXT,
    "activeOrganizationId" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "plan" "OrganizationPlan" NOT NULL DEFAULT 'BASIC',
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" TEXT,

    CONSTRAINT "store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_member" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_invitation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inviterId" UUID NOT NULL,

    CONSTRAINT "store_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "store_slug_key" ON "store"("slug");

-- CreateIndex
CREATE INDEX "store_member_organizationId_idx" ON "store_member"("organizationId");

-- CreateIndex
CREATE INDEX "store_member_userId_idx" ON "store_member"("userId");

-- CreateIndex
CREATE INDEX "store_invitation_organizationId_idx" ON "store_invitation"("organizationId");

-- CreateIndex
CREATE INDEX "store_invitation_email_idx" ON "store_invitation"("email");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_member" ADD CONSTRAINT "store_member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_member" ADD CONSTRAINT "store_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_invitation" ADD CONSTRAINT "store_invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_invitation" ADD CONSTRAINT "store_invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
