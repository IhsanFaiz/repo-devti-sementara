import * as yup from 'yup';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const bookRouter = createTRPCRouter({
  // 1. CREATE: Create a new book
  create: protectedProcedure
    .input(
      yup.object({
        title: yup.string().min(1).required(),
        author: yup.string().required(),
        year: yup.number().required(),
        genre: yup.string().required()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.book.create({
        data: {
          title: input.title,
          author: input.author,
          year: input.year,
          genre: input.genre
        }
      });
    }),

  // 2. READ: Get a list of all books
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.book.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }),

  // 3. PAGINATION: Get paginated list of books
  getPagination: protectedProcedure
    .input(
      yup.object({
        page: yup.number().min(1).default(1),
        limit: yup.number().min(1).max(100).default(10),
        search: yup.string().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const page = input.page || 1;
      const limit = input.limit || 10;
      const skip = (page - 1) * limit;

      // Run both queries in parallel for better performance
      const [books, total] = await ctx.db.$transaction([
        ctx.db.book.findMany({
          skip,
          take: limit,
          where: input.search
            ? {
                OR: [
                  { title: { contains: input.search, mode: 'insensitive' } },
                  { author: { contains: input.search, mode: 'insensitive' } },
                  { genre: { contains: input.search, mode: 'insensitive' } }
                ]
              }
            : undefined,
          orderBy: { createdAt: 'desc' }
        }),
        ctx.db.book.count({
          where: input.search
            ? {
                OR: [
                  { title: { contains: input.search, mode: 'insensitive' } },
                  { author: { contains: input.search, mode: 'insensitive' } },
                  { genre: { contains: input.search, mode: 'insensitive' } }
                ]
              }
            : undefined
        })
      ]);

      return {
        data: books,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      };
    }),

  // 4. READ: Get a single book by ID
  getById: protectedProcedure.input(yup.object({ id: yup.string().required() })).query(async ({ ctx, input }) => {
    return ctx.db.book.findUnique({
      where: { id: input.id }
    });
  }),

  // 5. UPDATE: Update an existing book
  update: protectedProcedure
    .input(
      yup.object({
        id: yup.string().required(),
        title: yup.string().optional(),
        author: yup.string().optional(),
        year: yup.number().optional(),
        genre: yup.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.book.update({
        where: { id },
        data: data // Prisma ignores undefined values in update automatically
      });
    }),

  // 6. DELETE: Remove a book
  delete: protectedProcedure.input(yup.object({ id: yup.string().required() })).mutation(async ({ ctx, input }) => {
    return ctx.db.book.delete({
      where: { id: input.id }
    });
  })
});
