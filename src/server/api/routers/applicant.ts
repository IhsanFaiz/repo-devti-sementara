// File: src/server/api/routers/applicant.ts
import * as yup from 'yup';
import { createTRPCRouter, protectedProcedure } from '../trpc';

type ApplicantResultStatus = 'PENDING' | 'PASSED' | 'FAILED';

export const applicantRouter = createTRPCRouter({
  // 1. CREATE: Create a new applicant
  create: protectedProcedure
    .input(
      yup.object({
        jobOpeningId: yup.number().nullable().optional(),
        firstName: yup.string().required(),
        lastName: yup.string().optional().default(''),
        placeOfBirth: yup.string().required(),
        dateOfBirth: yup.date().required(),
        domicile: yup.string().required(),
        phoneNumber: yup.string().required(),
        email: yup.string().email().required(),
        result: yup.string().default('PENDING'),
        documents: yup
          .array()
          .of(
            yup.object({
              documentType: yup.string().required(),
              path: yup.string().required()
            })
          )
          .optional()
          .default([])
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { documents, ...applicantData } = input;

      return ctx.db.applicant.create({
        data: {
          ...applicantData,
          applicantDocuments: {
            create: (documents || [])
              .filter((d) => d.path)
              .map((doc) => ({
                document: {
                  create: {
                    documentType: doc.documentType,
                    path: doc.path
                  }
                }
              }))
          }
        }
      });
    }),

  // 2. READ: Get a list of all applicants
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.applicant.findMany({
      orderBy: { id: 'desc' }
    });
  }),

  // 3. PAGINATION: Get paginated list of applicants
  getPagination: protectedProcedure
    .input(
      yup.object({
        page: yup.number().min(1).default(1),
        limit: yup.number().min(1).max(100).default(10),
        search: yup.string().optional(),
        result: yup.string().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const page = input.page || 1;
      const limit = input.limit || 10;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (input.search) {
        where.OR = [
          { firstName: { contains: input.search, mode: 'insensitive' as const } },
          { lastName: { contains: input.search, mode: 'insensitive' as const } },
          { email: { contains: input.search, mode: 'insensitive' as const } }
        ];
      }
      if (input.result) {
        where.result = input.result;
      }

      const [applicants, total, resultCounts] = await ctx.db.$transaction([
        ctx.db.applicant.findMany({
          skip,
          take: limit,
          where,
          orderBy: { id: 'desc' }
        }),

        ctx.db.applicant.count({
          where
        }),

        ctx.db.applicant.groupBy({
          by: ['result'],
          _count: {
            result: true
          },
          where,
          orderBy: { result: 'asc' }
        })
      ]);

      const formattedResultCounts: Record<ApplicantResultStatus | string, number> = {
        PENDING: 0,
        PASSED: 0,
        FAILED: 0
      };

      resultCounts.forEach((item) => {
        if (item.result && item._count && typeof item._count === 'object') {
          formattedResultCounts[item.result] = item._count.result ?? 0;
        }
      });

      return {
        data: applicants,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        resultCounts: formattedResultCounts
      };
    }),

  // 4. READ: Get a single applicant by ID
  getById: protectedProcedure.input(yup.object({ id: yup.number().required() })).query(async ({ ctx, input }) => {
    return ctx.db.applicant.findUnique({
      where: { id: input.id },
      include: {
        jobOpening: true,
        applicantDocuments: {
          include: {
            document: true
          }
        }
      }
    });
  }),

  // 5. UPDATE: Update an existing applicant
  update: protectedProcedure
    .input(
      yup.object({
        id: yup.number().required(),
        firstName: yup.string().optional(),
        lastName: yup.string().optional(),
        placeOfBirth: yup.string().optional(),
        dateOfBirth: yup.date().optional(),
        domicile: yup.string().optional(),
        phoneNumber: yup.string().optional(),
        email: yup.string().email().optional(),
        result: yup.string().nullable().optional(),
        administration: yup.string().nullable().optional(),
        writtenTest: yup.string().nullable().optional(),
        interview: yup.string().nullable().optional(),
        miniProject: yup.string().nullable().optional(),
        administrationScore: yup.number().nullable().optional(),
        writtenTestScore: yup.number().nullable().optional(),
        interviewScore: yup.number().nullable().optional(),
        miniProjectScore: yup.number().nullable().optional(),
        finalInterview: yup.string().nullable().optional(),
        documents: yup
          .array()
          .of(
            yup.object({
              documentType: yup.string().required(),
              path: yup.string().required()
            })
          )
          .optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, documents, ...data } = input;

      // Update applicant data
      const updatedApplicant = await ctx.db.applicant.update({
        where: { id },
        data: data
      });

      // If documents are provided, delete old ones and create new ones
      if (documents) {
        // Get existing document IDs to clean up
        const existingDocs = await ctx.db.applicantDocument.findMany({
          where: { applicantId: id },
          select: { documentId: true }
        });

        // Delete existing applicant documents
        await ctx.db.applicantDocument.deleteMany({
          where: { applicantId: id }
        });

        // Delete orphaned documents
        if (existingDocs.length > 0) {
          await ctx.db.document.deleteMany({
            where: { id: { in: existingDocs.map((d) => d.documentId) } }
          });
        }

        // Create new documents
        for (const doc of documents.filter((d) => d.path)) {
          const newDoc = await ctx.db.document.create({
            data: {
              documentType: doc.documentType,
              path: doc.path
            }
          });
          await ctx.db.applicantDocument.create({
            data: {
              applicantId: id,
              documentId: newDoc.id
            }
          });
        }
      }

      return updatedApplicant;
    }),

  // 6. DELETE: Remove an applicant
  delete: protectedProcedure.input(yup.object({ id: yup.number().required() })).mutation(async ({ ctx, input }) => {
    return ctx.db.applicant.delete({
      where: { id: input.id }
    });
  })
});
