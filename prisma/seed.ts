import { PrismaClient } from '../generated/prisma'; // Ensure this matches your schema output path
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seeding...');

  // Clean the database
  // Note: If you have relations, delete them in the correct order
  // await prisma.book.deleteMany();
  const password = "admin123"

  const passwordHash = await bcrypt.hash(password, 10)

  const users = [
    {
      email: 'admin@example.com',
      username: 'admin',
      password: passwordHash,
      role: 'admin'
    },
    {
      email: 'user@example.com',
      username: 'user',
      password: passwordHash,
      role: 'user'
    },
  ]

  await prisma.user.createMany({
      data: users,
      skipDuplicates: true,
    })
  
  console.log('✅ Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
