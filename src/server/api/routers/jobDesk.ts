import { createTRPCRouter, publicProcedure } from 'server/api/trpc';

export const jobDeskRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.jobDesk.findMany({
      select: {
        id: true,
        jobDeskName: true,
        description: true
      },
      orderBy: {
        jobDeskName: 'asc'
      }
    });
  })
});
