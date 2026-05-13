/*
  Warnings:

  - You are about to drop the column `productId` on the `cart_item` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cartId,storeListingId,variantId]` on the table `cart_item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,productId,storeListingId]` on the table `review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storeListingId` to the `cart_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeListingId` to the `order_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeName` to the `order_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeListingId` to the `review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "cart_item" DROP CONSTRAINT "cart_item_productId_fkey";

-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_productId_fkey";

-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_variantId_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_organizationId_fkey";

-- DropIndex
DROP INDEX "cart_item_cartId_productId_variantId_key";

-- DropIndex
DROP INDEX "review_userId_productId_key";

-- AlterTable
ALTER TABLE "cart_item" DROP COLUMN "productId",
ADD COLUMN     "storeListingId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "order_item" ADD COLUMN     "storeListingId" UUID NOT NULL,
ADD COLUMN     "storeName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product" DROP COLUMN "organizationId";

-- AlterTable
ALTER TABLE "review" ADD COLUMN     "storeListingId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "store_listing" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "buyPrice" DECIMAL(12,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_listing_variant" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storeListingId" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "price" DECIMAL(12,2),
    "buyPrice" DECIMAL(12,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_listing_variant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "store_listing_organizationId_idx" ON "store_listing"("organizationId");

-- CreateIndex
CREATE INDEX "store_listing_productId_idx" ON "store_listing"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "store_listing_organizationId_productId_key" ON "store_listing"("organizationId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "store_listing_variant_storeListingId_variantId_key" ON "store_listing_variant"("storeListingId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_item_cartId_storeListingId_variantId_key" ON "cart_item"("cartId", "storeListingId", "variantId");

-- CreateIndex
CREATE INDEX "order_item_orderId_idx" ON "order_item"("orderId");

-- CreateIndex
CREATE INDEX "order_item_storeListingId_idx" ON "order_item"("storeListingId");

-- CreateIndex
CREATE UNIQUE INDEX "review_userId_productId_storeListingId_key" ON "review"("userId", "productId", "storeListingId");

-- AddForeignKey
ALTER TABLE "store_listing" ADD CONSTRAINT "store_listing_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_listing" ADD CONSTRAINT "store_listing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_listing_variant" ADD CONSTRAINT "store_listing_variant_storeListingId_fkey" FOREIGN KEY ("storeListingId") REFERENCES "store_listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_listing_variant" ADD CONSTRAINT "store_listing_variant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_storeListingId_fkey" FOREIGN KEY ("storeListingId") REFERENCES "store_listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_storeListingId_fkey" FOREIGN KEY ("storeListingId") REFERENCES "store_listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_storeListingId_fkey" FOREIGN KEY ("storeListingId") REFERENCES "store_listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
