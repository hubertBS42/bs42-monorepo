/*
  Warnings:

  - You are about to drop the column `plan` on the `store` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "store" DROP COLUMN "plan";

-- DropEnum
DROP TYPE "OrganizationPlan";
