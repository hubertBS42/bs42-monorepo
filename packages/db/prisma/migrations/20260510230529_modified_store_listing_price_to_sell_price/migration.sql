/*
  Warnings:

  - You are about to drop the column `price` on the `store_listing` table. All the data in the column will be lost.
  - Added the required column `sellPrice` to the `store_listing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "store_listing" DROP COLUMN "price",
ADD COLUMN     "sellPrice" DECIMAL(12,2) NOT NULL;
