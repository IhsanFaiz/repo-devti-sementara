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

  const role = [
    {
      name: "admin"
    },
    {
      name: "user"
    }
  ]

  await prisma.role.createMany({
    data: role,
    skipDuplicates: true
  })

  const users = [
    {
      email: 'admin@example.com',
      username: 'admin',
      password: passwordHash,
      roleId: 1
    },
    {
      email: 'user@example.com',
      username: 'user',
      password: passwordHash,
      roleId: 2
    },
  ]

  await prisma.user.createMany({
      data: users,
      skipDuplicates: true,
    })

    const project = [
      {
        name: "Dashboard admin",
        description: "project dashboard admin manajement sistem",
        status: "ACTIVE",
      },
      {
        name: "Dashboard user",
        description: "project dashboard user manajement sistem",
        status: "DONE",
      },
      {
        name: "Dashboard manager",
        description: "project dashboard manager manajement sistem",
        status: "CANCELED"
      }
    ]

    await prisma.project.createMany({
      data: project,
      skipDuplicates: true
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
