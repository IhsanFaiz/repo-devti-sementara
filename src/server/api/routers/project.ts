import * as yup from 'yup';
import { createTRPCRouter, protectedProcedure } from '../trpc';


type ProjectStatus = 'ACTIVE' | 'DONE' | 'CANCELED' | 'WAITING';

export const projectRouter = createTRPCRouter({
  // 1. CREATE: Create a new project
  create: protectedProcedure
    .input(
      yup.object({
        name: yup.string().min(1).required(),
        description: yup.string().required(),
        status: yup.string().required(),
        member: yup.array().of(yup.number()).default([])
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          name: input.name,
          description: input.description,
          status: input.status,
          
          projectMembers: {
            create:
              input.member?.map((userId) => ({
                user: {
                  connect: {
                    id: userId
                  }
                }
              })) ?? []
          }
        }
      });
    }),

  // 2. READ: Get a list of all projects
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      orderBy: { createdAt: 'asc' }
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

    const where = input.search
      ? {
          OR: [
            { name: { contains: input.search, mode: 'insensitive' as const } },
            { description: { contains: input.search, mode: 'insensitive' as const } },
            { status: { contains: input.search, mode: 'insensitive' as const } }
          ]
        }
      : undefined;

    const [projects, total, statusCounts] = await ctx.db.$transaction([
      ctx.db.project.findMany({
        skip,
        take: limit,
        where,
        orderBy: { status: 'asc' }
      }),

      ctx.db.project.count({
        where
      }),

      ctx.db.project.groupBy({
        by: ['status'],
        _count: {
          status: true
        },
        where
      })
    ]);

    const formattedStatusCounts: Record<ProjectStatus, number> = {
      ACTIVE: 0,
      DONE: 0,
      CANCELED: 0,
      WAITING: 0
    };

    statusCounts.forEach((item) => {
      formattedStatusCounts[item.status as ProjectStatus] =
        item._count.status;
    });

    return {
      data: projects,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,

      statusCounts: formattedStatusCounts
    };
  }),

  // 4. READ: Get a single project by ID
  getById: protectedProcedure.input(yup.object({ id: yup.number().required() })).query(async ({ ctx, input }) => {
    return ctx.db.project.findUnique({
      where: { id: input.id },
      include: {
        projectMembers: {
          include: {
            user: true,
          }
        },

        request: true,
      }
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
  }),

  // 7. READ: Get a list of all projects by user id
  getByUserId: protectedProcedure
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

    const userId = Number(ctx.session.user.id);

    const whereClause = {
      projectMembers: {
        some: {
          userId
        }
      },

      ...(input.search && {
        OR: [
          {
            name: {
              contains: input.search,
              mode: 'insensitive' as const
            }
          },
          {
            description: {
              contains: input.search,
              mode: 'insensitive' as const
            }
          },
          {
            status: {
              contains: input.search,
              mode: 'insensitive' as const 
            }
          }
        ]
      })
    };

    const [projects, total] = await ctx.db.$transaction([
      ctx.db.project.findMany({
        skip,
        take: limit,
        where: whereClause,
        orderBy: {
          createdAt: 'asc'
        }
      }),

      ctx.db.project.count({
        where: whereClause
      })
    ]);

    return {
      data: projects,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }),

  startProject: protectedProcedure
  .input(
    yup.object({
      id: yup.number().required()
    })
  )
  .mutation(async ({ ctx, input }) => {
    const project = await ctx.db.project.findUnique({
      where: {
        id: input.id
      },
      include: {
        projectMembers: true,
        request: true
      }
    });

    if (!project) {
      throw new Error("Project not found");
    }

    if (project.projectMembers.length === 0) {
      throw new Error("Please assign at least one member before starting the project.");
    }

    if (project.status !== "WAITING") {
      throw new Error("Project has already been started.");
    }

    const startedAt = new Date();

    const dueDate = project.request?.slaDays
      ? new Date(
          startedAt.getTime() +
          project.request?.slaDays * 24 * 60 * 60 * 1000
        )
      : null;

    return await ctx.db.project.update({
      where: {
        id: input.id
      },
      data: {
        status: "ACTIVE",
        startedAt,
        dueDate
      }
    });
  }),

  assignMembers: protectedProcedure
  .input(
    yup.object({
      projectId: yup.number().required(),
      members: yup.array().of(yup.number().required()).required()
    })
  )
  .mutation(async ({ ctx, input }) => {

    await ctx.db.projectMember.deleteMany({
      where: {
        projectId: input.projectId
      }
    });

    await ctx.db.projectMember.createMany({
      data: input.members.map(userId => ({
        projectId: input.projectId,
        userId
      }))
    });

    return true;
  }),

  markAsDone: protectedProcedure
  .input(
    yup.object({
      id: yup.number().required()
    })
  )
  .mutation(async ({ ctx, input }) => {
    const project = await ctx.db.project.findUnique({
      where: {
        id: input.id
      }
    });

    if (!project) {
      throw new Error("Project not found");
    }

    return await ctx.db.project.update({
      where: {
        id: input.id
      },
      data: {
        status: "DONE",
        completedAt: new Date()
      }
    });
  }),

});

  
