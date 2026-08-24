-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "pageId" TEXT,
ADD COLUMN     "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "width" DOUBLE PRECISION,
ADD COLUMN     "x" DOUBLE PRECISION,
ADD COLUMN     "y" DOUBLE PRECISION,
ADD COLUMN     "zIndex" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AlbumPage" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "pageOrder" INTEGER NOT NULL,
    "layout" TEXT NOT NULL DEFAULT 'single',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlbumPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlbumPage_albumId_idx" ON "AlbumPage"("albumId");

-- CreateIndex
CREATE UNIQUE INDEX "AlbumPage_albumId_pageOrder_key" ON "AlbumPage"("albumId", "pageOrder");

-- CreateIndex
CREATE INDEX "Photo_pageId_order_idx" ON "Photo"("pageId", "order");

-- AddForeignKey
ALTER TABLE "AlbumPage" ADD CONSTRAINT "AlbumPage_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "AlbumPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
