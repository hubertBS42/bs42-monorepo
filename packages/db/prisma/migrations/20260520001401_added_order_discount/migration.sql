-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('FIXED', 'PERCENTAGE');

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "discountAmount" DECIMAL(12,2),
ADD COLUMN     "discountReason" TEXT,
ADD COLUMN     "discountType" "DiscountType",
ADD COLUMN     "discountValue" DECIMAL(12,2);
