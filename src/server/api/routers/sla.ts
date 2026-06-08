import * as yup from 'yup';
import { createTRPCRouter, protectedProcedure } from '../trpc';


type SlaStatus = 'ACHIEVED' | 'NOT ACHIEVED';

export const slaRouter = createTRPCRouter({

    // 2. PAGINATION: Get paginated list of request
    getPagination: protectedProcedure
    .query(async ({ ctx }) => {
    const requests = await ctx.db.request.findMany({
            include: {
            project: true
            }
        });

        const requestTypes = [
            "RFC_Change_App",
            "RFC_Change_API",
            "Permintaan_New_App_or_Major",
            "Permintaan_New_API_or_Major"
        ];

        const data = requestTypes.map((type, index) => {

            const filtered = requests.filter(
            (r) => r.serviceType === type
            );
            const projectDone = filtered.filter(
            (r) => r.project?.status === "DONE"
            );

            const totalRequest = projectDone.length;


            const achieved = projectDone.filter((r) => {
                const completedAt = r.project?.completedAt;
                const dueDate = r.project?.dueDate;

                if (!completedAt || !dueDate) {
                    return false;
                }

                return completedAt <= dueDate;
            }).length;

            const notAchieved = projectDone.length - achieved;

            const percentage =
            projectDone.length === 0
                ? 100
                : Math.round((achieved / projectDone.length) * 100);

            return {
            id: index + 1,
            requestType: type,
            totalRequest,
            meetingPercentage: percentage,
            status:
                percentage >= 97
                ? "ACHIEVED"
                : "NOT ACHIEVED"
            };
        });

        return {
            data
        };
    }),

    getSlaByType: protectedProcedure
    .input(yup.object({ 
        type: yup.string().required(),
        page: yup.number().min(1).default(1),
        limit: yup.number().min(1).max(100).default(10),
        search: yup.string().optional()
    }))
    .query(async ({ ctx, input }) => {
        const page = input.page;
        const limit = input.limit;
        const skip = (page - 1) * limit;

        const whereClause: any = {
            serviceType: input.type, 
            project: {
                status: "DONE"
            }
        };

        if (input.search) {
            whereClause.AND = [
                {
                    OR: [
                        { name: { contains: input.search, mode: 'insensitive' } },
                        { description: { contains: input.search, mode: 'insensitive' } },
                        { status: { contains: input.search, mode: 'insensitive' } }
                    ]
                }
            ];
        }

        // 2. Jalankan query data DAN count secara paralel menggunakan $transaction
        const [data, totalCount] = await ctx.db.$transaction([
            ctx.db.request.findMany({
                skip,
                take: limit,
                where: whereClause,
                include: {
                    project: true
                },
                orderBy: { id: 'asc' }
            }),
            ctx.db.request.count({
                where: whereClause
            })
        ]);

        const achieved = data.filter((r) => {
            const completedAt = r.project?.completedAt;
            const dueDate = r.project?.dueDate;

            if (!completedAt || !dueDate) {
                return false;
            }

            return completedAt <= dueDate;
        }).length
        
        const notAchieved = data.length - achieved;

        const percentage =
            data.length === 0
                ? 100
                : Math.round((achieved / data.length) * 100);
        
        return {
            data,
            meta: {
                totalData: totalCount,
                totalAchieved: achieved,
                totalNotAchieved: notAchieved,
                percentage,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                limit
            }
        };
    })

})