-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "deck" TEXT,
ADD COLUMN     "eyebrow" TEXT,
ADD COLUMN     "readTime" TEXT,
ADD COLUMN     "sections" JSONB,
ADD COLUMN     "timeline" JSONB;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "time" TEXT;

-- AlterTable
ALTER TABLE "GalleryCategory" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;
