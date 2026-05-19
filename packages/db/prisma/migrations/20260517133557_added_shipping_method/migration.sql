-- CreateEnum
CREATE TYPE "ShippingMethod" AS ENUM ('DELIVERY', 'PICKUP');

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "shippingMethod" "ShippingMethod" NOT NULL DEFAULT 'DELIVERY',
ALTER COLUMN "shippingLine1" DROP NOT NULL,
ALTER COLUMN "shippingName" DROP NOT NULL,
ALTER COLUMN "shippingRegion" DROP NOT NULL,
ALTER COLUMN "shippingTown" DROP NOT NULL;
