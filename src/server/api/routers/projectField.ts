import * as yup from 'yup';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const projectFieldRouter = createTRPCRouter({
  // 1. CREATE FIELD
  create: protectedProcedure
    .input(
      yup.object({
        projectId: yup.number().required(),
        label: yup.string().required(),
        type: yup.string().required(),
        required: yup.boolean().default(false),
        placeholder: yup.string().nullable().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.projectField.create({
        data: {
          projectId: input.projectId,
          label: input.label,
          type: input.type,
          required: input.required,
          placeholder: input.placeholder
        }
      });
    }),

  // 2. CREATE MANY FIELDS
  createMany: protectedProcedure
    .input(
      yup.object({
        projectId: yup.number().required(),

        fields: yup.array().of(
          yup.object({
            label: yup.string().required(),
            type: yup.string().required(),
            required: yup.boolean().default(false),
            placeholder: yup.string().nullable().optional()
          })
        ).required()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.projectField.createMany({
        data: input.fields.map((field) => ({
          projectId: input.projectId,
          label: field.label,
          type: field.type,
          required: field.required,
          placeholder: field.placeholder
        }))
      });
    }),

  // 3. GET ALL FIELDS BY PROJECT ID
  getByProjectId: protectedProcedure
  .input(
    yup.object({
      projectId: yup.number().required()
    })
  )
  .query(async ({ ctx, input }) => {
    return ctx.db.projectField.findMany({
      where: {
        projectId: input.projectId
      },

      include: {
        values: {
          include: {
            file: true,
            user: true
          }
        }
      },

      orderBy: {
        createdAt: 'asc'
      }
    });
  }),

  // 4. GET SINGLE FIELD
  getById: protectedProcedure
    .input(
      yup.object({
        id: yup.number().required()
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.projectField.findUnique({
        where: {
          id: input.id
        }
      });
    }),

  // 5. UPDATE FIELD
  update: protectedProcedure
    .input(
      yup.object({
        id: yup.number().required(),

        label: yup.string().optional(),
        type: yup.string().optional(),
        required: yup.boolean().optional(),
        placeholder: yup.string().nullable().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return ctx.db.projectField.update({
        where: {
          id
        },

        data
      });
    }),

  // 6. DELETE FIELD
  delete: protectedProcedure
    .input(
      yup.object({
        id: yup.number().required()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.projectField.delete({
        where: {
          id: input.id
        }
      });
    }),

  // 7. REPLACE ALL PROJECT FIELDS
  // useful when admin edits all fields at once
  replaceAll: protectedProcedure
    .input(
      yup.object({
        projectId: yup.number().required(),

        fields: yup.array().of(
          yup.object({
            label: yup.string().required(),
            type: yup.string().required(),
            required: yup.boolean().default(false),
            placeholder: yup.string().nullable().optional()
          })
        ).required()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        await tx.projectField.deleteMany({
          where: {
            projectId: input.projectId
          }
        });

        return tx.projectField.createMany({
          data: input.fields.map((field) => ({
            projectId: input.projectId,
            label: field.label,
            type: field.type,
            required: field.required,
            placeholder: field.placeholder
          }))
        });
      });
    })
});