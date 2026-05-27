import * as yup from 'yup';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const projectRouter = createTRPCRouter({
  // 1. CREATE: Create a new project
  create: protectedProcedure
    .input(
      yup.object({
        name: yup.string().min(1).required(),
        description: yup.string().required(),
        status: yup.string().required()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          name: input.name,
          description: input.description,
          status: input.status
        }
      });
    }),

  // 2. READ: Get a list of all projects
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }),

  // 3. PAGINATION: Get paginated list of projects
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
      const [projects, total] = await ctx.db.$transaction([
        ctx.db.project.findMany({
          skip,
          take: limit,
          where: input.search
            ? {
                OR: [
                  { name: { contains: input.search, mode: 'insensitive' } },
                  { description: { contains: input.search, mode: 'insensitive' } },
                  { status: { contains: input.search, mode: 'insensitive' } }
                ]
              }
            : undefined,
          orderBy: { createdAt: 'desc' }
        }),
        ctx.db.project.count({
          where: input.search
            ? {
                OR: [
                  { name: { contains: input.search, mode: 'insensitive' } },
                  { description: { contains: input.search, mode: 'insensitive' } },
                  { status: { contains: input.search, mode: 'insensitive' } }
                ]
              }
            : undefined
        })
      ]);

      return {
        data: projects,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      };
    }),

  // 4. READ: Get a single project by ID
  getById: protectedProcedure.input(yup.object({ id: yup.number().required() })).query(async ({ ctx, input }) => {
    return ctx.db.project.findUnique({
      where: { id: input.id }
    });
  }),

  // 5. UPDATE: Update an existing project
update: protectedProcedure
  .input(
    yup.object({
      id: yup.number().required(),
      name: yup.string().optional(),
      description: yup.string().optional(),
      status: yup.string().optional(),

      member: yup.array().of(yup.number()).optional()
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id, member, ...data } = input;

    return ctx.db.project.update({
      where: { id },

      data: {
        ...data,

        ...(member && {
          projectMembers: {
            deleteMany: {},

            create: member.map((userId) => ({
              user: {
                connect: {
                  id: userId
                }
              }
            }))
          }
        })
      }
    });
  }),

  // 6. DELETE: Remove a project
  delete: protectedProcedure.input(yup.object({ id: yup.number().required() })).mutation(async ({ ctx, input }) => {
    return ctx.db.project.delete({
      where: { id: input.id }
    });
  })
});
