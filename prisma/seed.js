const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Sunucu var mı kontrol et, yoksa ekle
  const server = await prisma.server.upsert({
    where: { name: "munjacraft" },
    update: {},
    create: {
      name: "munjacraft",
      description: "Hayali Minecraft sunucusu."
    },
  });
  console.log("Varsayılan sunucu eklendi:", server);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  }); 