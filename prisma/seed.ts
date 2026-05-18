import { PrismaClient } from '../generated/prisma'; // Ensure this matches your schema output path
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seeding...');

  // Clean the database
  // Note: If you have relations, delete them in the correct order
  await prisma.book.deleteMany();

  console.log('🧹 Database cleaned.');

  // Create mock books
  const books = [
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      year: 1925,
      genre: 'Classic'
    },
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      year: 1960,
      genre: 'Fiction'
    },
    {
      title: '1984',
      author: 'George Orwell',
      year: 1949,
      genre: 'Dystopian'
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      year: 1813,
      genre: 'Romance'
    },
    {
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      year: 1951,
      genre: 'Fiction'
    },
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      year: 1937,
      genre: 'Fantasy'
    },
    {
      title: 'Fahrenheit 451',
      author: 'Ray Bradbury',
      year: 1953,
      genre: 'Dystopian'
    },
    {
      title: 'Moby Dick',
      author: 'Herman Melville',
      year: 1851,
      genre: 'Adventure'
    },
    {
      title: 'War and Peace',
      author: 'Leo Tolstoy',
      year: 1869,
      genre: 'Historical Fiction'
    },
    {
      title: 'The Odyssey',
      author: 'Homer',
      year: -800,
      genre: 'Epic'
    },
    {
      title: 'Crime and Punishment',
      author: 'Fyodor Dostoevsky',
      year: 1866,
      genre: 'Psychological Fiction'
    },
    {
      title: 'Brave New World',
      author: 'Aldous Huxley',
      year: 1932,
      genre: 'Dystopian'
    },
    {
      title: 'The Divine Comedy',
      author: 'Dante Alighieri',
      year: 1320,
      genre: 'Epic Poetry'
    },
    {
      title: 'The Brothers Karamazov',
      author: 'Fyodor Dostoevsky',
      year: 1880,
      genre: 'Philosophical Fiction'
    },
    {
      title: 'Wuthering Heights',
      author: 'Emily Brontë',
      year: 1847,
      genre: 'Gothic Fiction'
    }
  ];

  for (const book of books) {
    const createdBook = await prisma.book.create({
      data: book
    });
    console.log(`📚 Created book: ${createdBook.title}`);
  }

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
