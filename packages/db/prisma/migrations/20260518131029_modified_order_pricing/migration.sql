/*
  Warnings:

  - You are about to drop the column `subtotal` on the `order` table. All the data in the column will be lost.
  - Added the required column `subtotalGhs` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotalUsd` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order" DROP COLUMN "subtotal",
ADD COLUMN     "subtotalGhs" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "subtotalUsd" DECIMAL(12,2) NOT NULL;
