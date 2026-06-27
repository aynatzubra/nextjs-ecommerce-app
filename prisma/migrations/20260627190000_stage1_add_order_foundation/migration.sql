-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'MDL',
ADD COLUMN     "requestId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
-- Rename existing productName column to preserve data, then add new snapshot columns as nullable.
ALTER TABLE "OrderItem" RENAME COLUMN "productName" TO "title";
ALTER TABLE "OrderItem" ADD COLUMN     "lineTotal" DECIMAL(65,30),
ADD COLUMN     "productImage" TEXT,
ADD COLUMN     "productSlug" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ALTER COLUMN "currency" SET DEFAULT 'MDL';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'MDL',
ADD COLUMN     "sku" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_requestId_key" ON "Order"("requestId");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_productId_idx" ON "OrderItem"("orderId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
