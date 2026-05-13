/*
  Warnings:

  - You are about to drop the column `variantId` on the `cart_item` table. All the data in the column will be lost.
  - You are about to drop the column `inStock` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `isFeatured` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `lowStockThreshold` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `trackInventory` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `buyPrice` on the `product_variant` table. All the data in the column will be lost.
  - You are about to drop the column `compareAtPrice` on the `product_variant` table. All the data in the column will be lost.
  - You are about to drop the column `inStock` on the `product_variant` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `product_variant` table. All the data in the column will be lost.
  - You are about to drop the column `lowStockThreshold` on the `product_variant` table. All the data in the column will be lost.
  - You are about to drop the column `sellPrice` on the `product_variant` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `product_variant` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `store_listing` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `store_listing_variant` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `store_listing_variant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cartId,storeListingId]` on the table `cart_item` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "cart_item" DROP CONSTRAINT "cart_item_variantId_fkey";

-- DropIndex
DROP INDEX "cart_item_cartId_storeListingId_variantId_key";

-- AlterTable
ALTER TABLE "cart_item" DROP COLUMN "variantId",
ADD COLUMN     "storeListingVariantId" UUID;

-- AlterTable
ALTER TABLE "product" DROP COLUMN "inStock",
DROP COLUMN "isFeatured",
DROP COLUMN "lowStockThreshold",
DROP COLUMN "stock",
DROP COLUMN "trackInventory";

-- AlterTable
ALTER TABLE "product_variant" DROP COLUMN "buyPrice",
DROP COLUMN "compareAtPrice",
DROP COLUMN "inStock",
DROP COLUMN "isActive",
DROP COLUMN "lowStockThreshold",
DROP COLUMN "sellPrice",
DROP COLUMN "stock";

-- AlterTable
ALTER TABLE "store_listing" DROP COLUMN "isActive",
ADD COLUMN     "compareAtPrice" DECIMAL(12,2),
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "trackInventory" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "store_listing_variant" DROP COLUMN "isActive",
DROP COLUMN "price",
ADD COLUMN     "compareAtPrice" DECIMAL(12,2),
ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sellPrice" DECIMAL(12,2),
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "trackInventory" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "cart_item_cartId_storeListingId_key" ON "cart_item"("cartId", "storeListingId");

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_storeListingVariantId_fkey" FOREIGN KEY ("storeListingVariantId") REFERENCES "store_listing_variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
