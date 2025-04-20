import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function deleteImages() {
  await prisma.image.deleteMany({});
  console.log("✔ All images deleted.");
}

deleteImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
