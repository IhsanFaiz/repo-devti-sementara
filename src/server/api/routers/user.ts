import * as yup from 'yup';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  // 1. CREATE: Create a new user
  create: protectedProcedure
    .input(
      yup.object({
        username: yup.string().min(1).required(),
        email: yup.string().required(),
        password: yup.string().required(),
        roleId: yup.number().required()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.create({
        data: {
          username: input.username,
          email: input.email,
          password: input.password,
          roleId: input.roleId
        }
      });
    }),

  // 2. READ: Get a list of all users
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      include: { role: true },
      orderBy: { id: 'asc' }
    });
  }),

  // 3. PAGINATION: Get paginated list of users
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
      const [users, total] = await ctx.db.$transaction([
        ctx.db.user.findMany({
          skip,
          take: limit,
          where: input.search
            ? {
                OR: [
                  { username: { contains: input.search, mode: 'insensitive' } },
                  { email: { contains: input.search, mode: 'insensitive' } },
                ]
              }
            : undefined,
          include: { role: true },
          orderBy: { id: 'asc' }
        }),
        ctx.db.user.count({
          where: input.search
            ? {
                OR: [
                  { username: { contains: input.search, mode: 'insensitive' } },
                  { email: { contains: input.search, mode: 'insensitive' } },
                ]
              }
            : undefined
        })
      ]);

      return {
        data: users,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      };
    }),

  // 4. READ: Get a single user by ID
  getById: protectedProcedure.input(yup.object({ id: yup.number().required() })).query(async ({ ctx, input }) => {
    return ctx.db.user.findUnique({
      where: { id: input.id },
      include: { role: true }
    });
  }),

  // 5. UPDATE: Update an existing user
  update: protectedProcedure
    .input(
      yup.object({
        id: yup.number().required(),
        email: yup.string().optional(),
        username: yup.string().optional(),
        roleId: yup.number().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.user.update({
        where: { id },
        data: data // Prisma ignores undefined values in update automatically
      });
    }),

  // 6. DELETE: Remove a user
  delete: protectedProcedure.input(yup.object({ id: yup.number().required() })).mutation(async ({ ctx, input }) => {
    return ctx.db.user.delete({
      where: { id: input.id }
    });
  })
});