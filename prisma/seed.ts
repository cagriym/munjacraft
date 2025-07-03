import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  // Admin kullanıcı var mı kontrol et, yoksa ekle
  const adminEmail = "admin@munjacraft.com";
  const adminPassword = "admin123";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      fullname: "Admin",
      role: "ADMIN",
    },
  });
  console.log(
    "Varsayılan admin kullanıcı eklendi:",
    adminEmail,
    "/",
    adminPassword
  );

  // 10 yeni USER ekle
  for (let i = 0; i < 10; i++) {
    const password = await bcrypt.hash("user1234", 10);
    const fullname = faker.person.fullName();
    const email = faker.internet.email();
    const nickname = faker.internet.userName();
    const birthdate = faker.date.between({
      from: "1990-01-01",
      to: "2010-12-31",
    });
    const phone = faker.phone.number();
    const country = faker.location.country();
    const city = faker.location.city();
    const district = faker.location.county();
    const address = faker.location.streetAddress();
    const bio = faker.lorem.sentence();
    const website = faker.internet.url();
    await prisma.user.create({
      data: {
        email,
        password,
        fullname,
        nickname,
        birthdate,
        role: "USER",
        phone,
        country,
        city,
        district,
        address,
        bio,
        website,
        isAddressVerified: true,
      },
    });
    console.log(`Kullanıcı eklendi: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
