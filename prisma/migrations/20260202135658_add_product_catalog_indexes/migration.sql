-- CreateIndex
CREATE INDEX "Product_isActive_createdAt_idx" ON "Product"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "Product_isActive_categoryId_createdAt_idx" ON "Product"("isActive", "categoryId", "createdAt");

-- CreateIndex
CREATE INDEX "Product_isActive_categoryId_price_idx" ON "Product"("isActive", "categoryId", "price");

-- CreateIndex
CREATE INDEX "Product_isActive_categoryId_stock_idx" ON "Product"("isActive", "categoryId", "stock");
