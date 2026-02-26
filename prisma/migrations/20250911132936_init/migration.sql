-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "descriptionHtml" TEXT,
    "availableForSale" BOOLEAN NOT NULL DEFAULT true,
    "options" JSONB,
    "minVariantPriceAmount" DECIMAL(18,6),
    "minVariantPriceCurrency" TEXT,
    "maxVariantPriceAmount" DECIMAL(18,6),
    "maxVariantPriceCurrency" TEXT,
    "featuredImageId" TEXT,
    "seoId" TEXT,
    "tags" TEXT[],
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "availableForSale" BOOLEAN NOT NULL DEFAULT true,
    "selectedOptions" JSONB,
    "priceAmount" DECIMAL(18,6) NOT NULL,
    "priceCurrency" TEXT NOT NULL,
    "sku" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "productId" TEXT,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Collection" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "seoId" TEXT,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CollectionProduct" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "order" INTEGER,

    CONSTRAINT "CollectionProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SEO" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,

    CONSTRAINT "SEO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Page" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "body" TEXT,
    "bodySummary" TEXT,
    "seoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Menu" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cart" (
    "id" TEXT NOT NULL,
    "checkoutUrl" TEXT,
    "subtotalAmount" DECIMAL(18,6),
    "subtotalCurrency" TEXT,
    "totalAmount" DECIMAL(18,6),
    "totalCurrency" TEXT,
    "totalTaxAmount" DECIMAL(18,6),
    "taxCurrency" TEXT,
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "userId" TEXT,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL,
    "totalAmount" DECIMAL(18,6) NOT NULL,
    "currency" TEXT NOT NULL,
    "merchandiseSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_handle_key" ON "public"."Product"("handle");

-- CreateIndex
CREATE INDEX "Product_handle_idx" ON "public"."Product"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_handle_key" ON "public"."Collection"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionProduct_collectionId_productId_key" ON "public"."CollectionProduct"("collectionId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_handle_key" ON "public"."Page"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "Menu_handle_key" ON "public"."Menu"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_seoId_fkey" FOREIGN KEY ("seoId") REFERENCES "public"."SEO"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Image" ADD CONSTRAINT "Image_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Collection" ADD CONSTRAINT "Collection_seoId_fkey" FOREIGN KEY ("seoId") REFERENCES "public"."SEO"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CollectionProduct" ADD CONSTRAINT "CollectionProduct_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."Collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CollectionProduct" ADD CONSTRAINT "CollectionProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Page" ADD CONSTRAINT "Page_seoId_fkey" FOREIGN KEY ("seoId") REFERENCES "public"."SEO"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "public"."Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
