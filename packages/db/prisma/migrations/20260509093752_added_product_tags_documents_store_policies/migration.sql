-- AlterTable
ALTER TABLE "product" ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "store" ADD COLUMN     "returnsPolicy" TEXT,
ADD COLUMN     "shippingPolicy" TEXT;

-- CreateTable
CREATE TABLE "product_document" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_document_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "product_document" ADD CONSTRAINT "product_document_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
