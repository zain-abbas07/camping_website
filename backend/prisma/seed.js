const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const realImages = [
  'https://www.istockphoto.com/photo/family-vacation-travel-rv-holiday-trip-in-motorhome-caravan-car-vacation-gm1656804429-534609023?utm_campaign=srp_photos_top&utm_content=https%3A%2F%2Funsplash.com%2Fs%2Fphotos%2Fcamping&utm_medium=affiliate&utm_source=unsplash&utm_term=camping%3A%3A%3A',
  'https://unsplash.com/photos/orange-camping-tent-near-green-trees-y8Ngwq34_Ak'  ,
  'https://unsplash.com/photos/person-sitting-near-bonfire-surrounded-by-trees-1azAjl8FTnU'
];

function getRandomImages(count = 2) {
  return realImages
    .sort(() => 0.5 - Math.random())
    .slice(0, count)
    .map(url => ({ url }));
}

async function addImagesToCampsites() {
  try {
    const campsites = await prisma.campsite.findMany();

    for (const campsite of campsites) {
      const imagesToAdd = getRandomImages(2);
      await prisma.image.createMany({
        data: imagesToAdd.map(img => ({
          url: img.url,
          campsiteId: campsite.id,
        })),
      });
      console.log(`🖼️ Added images to: ${campsite.name}`);
    }

    console.log('✅ Images added to all campsites!');
  } catch (err) {
    console.error('❌ Error adding images:', err);
  } finally {
    await prisma.$disconnect();
  }
}

addImagesToCampsites();
