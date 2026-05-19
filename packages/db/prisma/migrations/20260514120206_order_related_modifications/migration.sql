/*
  Warnings:

  - You are about to drop the column `deliveredAt` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `isDelivered` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `isPaid` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `itemsPrice` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `paymentResult` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAddress` on the `order` table. All the data in the column will be lost.
  - The `paymentMethod` column on the `order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `image` on the `order_item` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `order_item` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `order_item` table. All the data in the column will be lost.
  - You are about to drop the column `qty` on the `order_item` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `order_item` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `order_item` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reference]` on the table `order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerEmail` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exchangeRate` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingLine1` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingName` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingRegion` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingTown` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `order_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `order_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productSlug` to the `order_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `order_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `order_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `order_item` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'MOBILE_MONEY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED');

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_userId_fkey";

-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_productId_fkey";

-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_variantId_fkey";

-- AlterTable
ALTER TABLE "order" DROP COLUMN "deliveredAt",
DROP COLUMN "isDelivered",
DROP COLUMN "isPaid",
DROP COLUMN "itemsPrice",
DROP COLUMN "paymentResult",
DROP COLUMN "shippingAddress",
ADD COLUMN     "createdById" UUID,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'GHS',
ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "exchangeRate" DECIMAL(12,6) NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "reference" TEXT NOT NULL,
ADD COLUMN     "shippingLat" DOUBLE PRECISION,
ADD COLUMN     "shippingLine1" TEXT NOT NULL,
ADD COLUMN     "shippingLine2" TEXT,
ADD COLUMN     "shippingLng" DOUBLE PRECISION,
ADD COLUMN     "shippingName" TEXT NOT NULL,
ADD COLUMN     "shippingPhone" TEXT,
ADD COLUMN     "shippingRegion" TEXT NOT NULL,
ADD COLUMN     "shippingTown" TEXT NOT NULL,
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "subtotal" DECIMAL(12,2) NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
ALTER COLUMN "paidAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "order_item" DROP COLUMN "image",
DROP COLUMN "name",
DROP COLUMN "price",
DROP COLUMN "qty",
DROP COLUMN "slug",
DROP COLUMN "variantId",
ADD COLUMN     "organizationId" UUID NOT NULL,
ADD COLUMN     "productImage" TEXT,
ADD COLUMN     "productName" TEXT NOT NULL,
ADD COLUMN     "productSlug" TEXT NOT NULL,
ADD COLUMN     "productVariantId" UUID,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "storeListingVariantId" UUID,
ADD COLUMN     "totalPrice" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "unitPrice" DECIMAL(12,2) NOT NULL,
ALTER COLUMN "productId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "changedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_status_history_orderId_idx" ON "order_status_history"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "order_reference_key" ON "order"("reference");

-- CreateIndex
CREATE INDEX "order_userId_idx" ON "order"("userId");

-- CreateIndex
CREATE INDEX "order_status_idx" ON "order"("status");

-- CreateIndex
CREATE INDEX "order_reference_idx" ON "order"("reference");

-- CreateIndex
CREATE INDEX "order_item_organizationId_idx" ON "order_item"("organizationId");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_storeListingVariantId_fkey" FOREIGN KEY ("storeListingVariantId") REFERENCES "store_listing_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
