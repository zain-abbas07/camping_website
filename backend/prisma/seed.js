const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { name: "Lucas Dupont", email: "lucas.dupont@example.com", password: "hashed_password_1" },
      { name: "Emma Verhoeven", email: "emma.verhoeven@example.com", password: "hashed_password_2" },
      { name: "Noah Peeters", email: "noah.peeters@example.com", password: "hashed_password_3" },
      { name: "Léa Fontaine", email: "lea.fontaine@example.com", password: "hashed_password_4" },
      { name: "Arthur Janssens", email: "arthur.janssens@example.com", password: "hashed_password_5" },
    ],
  });

  await prisma.campsite.createMany({
    data: [
      { name: "Ardennes Forest Camp", location: "Ardennes, Belgium", description: "A peaceful camping spot.", price: 45.00 },
      { name: "Lake Eupen Retreat", location: "Eupen, Belgium", description: "Lakeside retreat for relaxation.", price: 60.00 },
      { name: "Camp Hoge Kempen", location: "Hoge Kempen, Belgium", description: "Great hiking trails.", price: 55.00 },
      { name: "Dunes Camping", location: "De Panne, Belgium", description: "Coastal campsite with beach access.", price: 70.00 },
      { name: "Flemish Countryside Getaway", location: "Bruges, Belgium", description: "Camping near Bruges.", price: 50.00 },
    ],
  });

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
