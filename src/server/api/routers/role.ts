import * as yup from 'yup';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const roleRouter = createTRPCRouter({
  // Get all roles
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.role.findMany({ orderBy: { id: 'asc' } });
  }),

  // Get role by id
  getById: protectedProcedure.input(yup.object({ id: yup.number().required() })).query(async ({ ctx, input }) => {
    return ctx.db.role.findUnique({ where: { id: input.id } });
  })
});
