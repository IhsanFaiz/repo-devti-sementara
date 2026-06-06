import * as yup from 'yup';
import { createTRPCRouter, protectedProcedure } from '../trpc';


type SlaStatus = 'ACHIEVED' | 'NOT ACHIEVED';

export const slaRouter = createTRPCRouter({

    // 2. PAGINATION: Get paginated list of request
    getPagination: protectedProcedure.query(async ({ ctx }) => {

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
    })

})