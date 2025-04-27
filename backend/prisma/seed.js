import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
const prisma = new PrismaClient();

async function main() {
  const imagePaths = [
    // "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/2422265/pexels-photo-2422265.jpeg? "
    ];

  const now = new Date();

  for (let i = 0; i < 1; i++) {
    await prisma.image.create({
      data: {
        url: imagePaths[i],
        campsiteId: 5 + i,
        createdAt: now,
        updatedAt: now,
      }
    });
  }

  console.log('Seed completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
