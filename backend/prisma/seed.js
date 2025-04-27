const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updateCoordinates = async () => {
  const locations = await prisma.location.findMany();

  for (const location of locations) {
    const address = `${location.city}, ${location.state || ''}, ${location.country}`;
    try {
      const res = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1,
        },
      });

      if (res.data.length > 0) {
        const { lat, lon } = res.data[0];
        await prisma.location.update({
          where: { id: location.id },
          data: {
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
          },
        });
        console.log(`Updated location ${location.id} with coordinates: ${lat}, ${lon}`);
      } else {
        console.warn(`No coordinates found for location ${location.id}`);
      }
    } catch (err) {
      console.error(`Failed to fetch coordinates for location ${location.id}:`, err.message);
    }
  }

  prisma.$disconnect();
};

updateCoordinates();