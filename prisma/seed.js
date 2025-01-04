import { PrismaClient } from '@prisma/client';
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();


async function main() {

  const adminPassword = process.env.ADMIN_PASSWORD;
  if(!adminPassword) return null
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    },
  });
  console.log("Admin user seeded!");
}
main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
