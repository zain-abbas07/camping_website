/*
  Warnings:

  - You are about to drop the column `listingId` on the `message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `message_listingId_fkey`;

-- DropIndex
DROP INDEX `message_listingId_fkey` ON `message`;

-- AlterTable
ALTER TABLE `message` DROP COLUMN `listingId`,
    ADD COLUMN `campsiteId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_campsiteId_fkey` FOREIGN KEY (`campsiteId`) REFERENCES `campsite`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
