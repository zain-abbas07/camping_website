-- AlterTable
ALTER TABLE `message` ADD COLUMN `listingId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `campsite`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
