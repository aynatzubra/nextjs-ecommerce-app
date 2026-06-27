-- Backfill Product.sku from slug for existing rows.
UPDATE "Product"
SET sku = slug
WHERE sku IS NULL;

-- Backfill Order.requestId with random UUIDs for existing rows.
UPDATE "Order"
SET "requestId" = gen_random_uuid()
WHERE "requestId" IS NULL;

-- Backfill OrderItem snapshot fields from the related Product where possible.
UPDATE "OrderItem" oi
SET
  "title"       = COALESCE(oi."title", p.name),
  "productSlug" = COALESCE(p.slug, 'deleted'),
  "sku"         = COALESCE(p.sku, p.slug, 'N/A'),
  "productImage"= p.images[1],
  "lineTotal"   = oi.price * oi.quantity,
  "updatedAt"   = CURRENT_TIMESTAMP
FROM "Product" p
WHERE oi."productId" = p.id
  AND (
    oi."productSlug" IS NULL
    OR oi."sku" IS NULL
    OR oi."lineTotal" IS NULL
    OR oi."updatedAt" IS NULL
  );

-- Fallback for OrderItem rows without a related Product (e.g. product was deleted earlier).
UPDATE "OrderItem"
SET
  "productSlug" = COALESCE("productSlug", 'deleted'),
  "sku"         = COALESCE("sku", 'N/A'),
  "lineTotal"   = COALESCE("lineTotal", price * quantity),
  "updatedAt"   = COALESCE("updatedAt", CURRENT_TIMESTAMP)
WHERE "productId" IS NULL
   OR "lineTotal" IS NULL
   OR "updatedAt" IS NULL;

-- Set NOT NULL for fields that must be populated from now on.
ALTER TABLE "Product" ALTER COLUMN "sku" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "requestId" SET NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "title" SET NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "productSlug" SET NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "sku" SET NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "lineTotal" SET NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "updatedAt" SET NOT NULL;

-- Add CHECK constraints for data integrity.
ALTER TABLE "Product" ADD CONSTRAINT "product_price_non_negative" CHECK ("price" >= 0);
ALTER TABLE "Order" ADD CONSTRAINT "order_total_amount_non_negative" CHECK ("totalAmount" >= 0);
ALTER TABLE "OrderItem" ADD CONSTRAINT "order_item_quantity_positive" CHECK ("quantity" > 0);
ALTER TABLE "OrderItem" ADD CONSTRAINT "order_item_price_non_negative" CHECK ("price" >= 0);
ALTER TABLE "OrderItem" ADD CONSTRAINT "order_item_line_total_non_negative" CHECK ("lineTotal" >= 0);
