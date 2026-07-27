-- Add event scheduling/media fields and link event uploads to gallery albums.
ALTER TABLE "Event" ADD COLUMN "deadlineAt" TIMESTAMP(3);
ALTER TABLE "Event" ADD COLUMN "videoUrl" TEXT;
ALTER TABLE "Event" ADD COLUMN "videoPublicId" TEXT;
ALTER TABLE "Event" ADD COLUMN "galleryAlbumId" TEXT;

ALTER TABLE "GalleryImage" ADD COLUMN "sourceEventId" TEXT;

ALTER TABLE "Event" ADD CONSTRAINT "Event_galleryAlbumId_fkey" FOREIGN KEY ("galleryAlbumId") REFERENCES "GalleryAlbum"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_sourceEventId_fkey" FOREIGN KEY ("sourceEventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
