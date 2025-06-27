import { PrismaClient, Role, Rank } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    if (user.role !== "ADMIN" && user.role !== "USER") {
      // Move old role to rank, set role to USER
      await prisma.user.update({
        where: { id: user.id },
        data: {
          rank: user.role as Rank,
          role: "USER",
        },
      });
      console.log(
        `User ${user.id}: role '${user.role}' moved to rank, role set to USER.`
      );
    }
  }
  console.log("Role/rank migration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
