/*
  Warnings:

  - You are about to drop the column `basePrice` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product" DROP COLUMN "basePrice",
ADD COLUMN     "baseSellPrice" DECIMAL(12,2) NOT NULL DEFAULT 0;
