import * as yup from 'yup';
import { createTRPCRouter, protectedProcedure } from '../trpc';


type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export const requestRouter = createTRPCRouter({
    // 1. CREATE: Create a new request
    create: protectedProcedure
    .input(
      yup.object({
        references: yup.string().required(),

        via: yup.string().optional(),
        psal: yup.string().optional(),
        department: yup.string().optional(),
        category: yup.string().optional(),
        applicationName: yup.string().optional(),
        framework: yup.string().optional(),
        version: yup.string().optional(),
        description: yup.string().optional(),

        groupType: yup.string().optional(),
        serviceType: yup.string().optional(),
        subServiceType: yup.string().optional(),

        priority: yup.string().optional(),
        slaDays: yup.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.request.create({
        data: input,
      });
    }),

    // 2. PAGINATION: Get paginated list of request
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
                { references: { contains: input.search, mode: 'insensitive' as const } },
                { applicationName: { contains: input.search, mode: 'insensitive' as const } },
                { status: { contains: input.search, mode: 'insensitive' as const } }
              ]
            }
          : undefined;
    
        const [request, total, statusCounts] = await ctx.db.$transaction([
            ctx.db.request.findMany({
                skip,
                take: limit,
                where,
                orderBy: { submittedAt: 'desc' }
            }),
            
            
            ctx.db.request.count({
            where
          }),
    
          ctx.db.request.groupBy({
            by: ['status'],
            _count: {
              status: true
            },
            where
          })
        ]);

    
        const formattedStatusCounts: Record<RequestStatus, number> = {
          PENDING: 0,
          APPROVED: 0,
          REJECTED: 0
        };
    
        statusCounts.forEach((item) => {
          formattedStatusCounts[item.status as RequestStatus] =
            item._count.status;
        });
    
        console.log(statusCounts)
    
        return {
          data: request,
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
    
          statusCounts: formattedStatusCounts
        };
      }),

    // 3. READ: Get a single request by ID
      getById: protectedProcedure.input(yup.object({ id: yup.number().required() })).query(async ({ ctx, input }) => {
        return ctx.db.request.findUnique({
          where: { id: input.id },
        });
      }),
    
  // 4. UPDATE: Update an existing request
    update: protectedProcedure
    .input(
        yup.object({
        id: yup.number().required(),
        references: yup.string().optional(),

        via: yup.string().optional(),
        psal: yup.string().optional(),
        department: yup.string().optional(),
        category: yup.string().optional(),
        applicationName: yup.string().optional(),
        framework: yup.string().optional(),
        version: yup.string().optional(),
        description: yup.string().optional(),

        groupType: yup.string().optional(),
        serviceType: yup.string().optional(),
        subServiceType: yup.string().optional(),

        priority: yup.string().optional(),
        slaDays: yup.number().optional(),
        })
    )
    .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;

        return ctx.db.request.update({
        where: { id },

        data: {
            ...data,
        }
        });
    }),

    // 5. DELETE: Remove a request
    delete: protectedProcedure.input(yup.object({ id: yup.number().required() })).mutation(async ({ ctx, input }) => {
        return ctx.db.request.delete({
            where: { id: input.id }
        });
    }),


})