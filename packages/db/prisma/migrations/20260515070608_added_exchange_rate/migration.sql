-- CreateTable
CREATE TABLE "exchange_rate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "rate" DECIMAL(12,6) NOT NULL,
    "date" DATE NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_rate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exchange_rate_from_to_idx" ON "exchange_rate"("from", "to");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rate_from_to_date_key" ON "exchange_rate"("from", "to", "date");
