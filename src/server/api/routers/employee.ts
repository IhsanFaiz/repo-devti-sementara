import * as yup from 'yup';
import { createTRPCRouter, publicProcedure } from 'server/api/trpc';

export const employeeRouter = createTRPCRouter({
  getSummary: publicProcedure.query(async ({ ctx }) => {
    const employees = await ctx.db.employee.findMany({
      where: {
        status: {
          notIn: ['Resign', 'Habis Kontrak', 'Pindah']
        }
      }
    });

    const summaryData: Record<string, any> = {};

    let totalTetap = 0;
    let totalProf = 0;
    let totalTlh = 0;
    let totalMagang = 0;
    let totalOutsource = 0;

    employees.forEach((emp) => {
      const role =
        emp.jobDesc && emp.jobDesc !== '-' && emp.jobDesc !== ''
          ? emp.jobDesc
          : emp.currentPosition && emp.currentPosition !== '-' && emp.currentPosition !== ''
            ? emp.currentPosition
            : emp.previousPosition && emp.previousPosition !== '-' && emp.previousPosition !== ''
              ? emp.previousPosition
              : 'Tanpa Job Desk/SOTK';

      if (!summaryData[role]) {
        summaryData[role] = { role: role, tetap: 0, prof: 0, tlh: 0, magang: 0, outsource: 0, total: 0 };
      }

      const type = emp.employeeType || '';

      if (type.includes('Pegawai Tetap')) {
        summaryData[role].tetap += 1;
        summaryData[role].total += 1;
        totalTetap += 1;
      } else if (type.includes('Profesional')) {
        summaryData[role].prof += 1;
        summaryData[role].total += 1;
        totalProf += 1;
      } else if (type.includes('Tenaga Lepas Harian')) {
        summaryData[role].tlh += 1;
        summaryData[role].total += 1;
        totalTlh += 1;
      } else if (type.includes('Magang Akademik')) {
        summaryData[role].magang += 1;
        summaryData[role].total += 1;
        totalMagang += 1;
      } else if (type.includes('Outsource')) {
        summaryData[role].outsource += 1;
        summaryData[role].total += 1;
        totalOutsource += 1;
      }
    });

    const totalAll = totalTetap + totalProf + totalTlh + totalMagang + totalOutsource;

    const pieData = [
      { name: 'Pegawai Tetap', value: totalAll > 0 ? (totalTetap / totalAll) * 100 : 0, color: '#1a1d29', rawCount: totalTetap },
      { name: 'Profesional', value: totalAll > 0 ? (totalProf / totalAll) * 100 : 0, color: '#5b7083', rawCount: totalProf },
      { name: 'TLH', value: totalAll > 0 ? (totalTlh / totalAll) * 100 : 0, color: '#bb2a33', rawCount: totalTlh },
      { name: 'Magang Akademik', value: totalAll > 0 ? (totalMagang / totalAll) * 100 : 0, color: '#f28e8e', rawCount: totalMagang },
      { name: 'Outsource', value: totalAll > 0 ? (totalOutsource / totalAll) * 100 : 0, color: '#ffb347', rawCount: totalOutsource }
    ];

    const totalsRow = {
      role: 'Jumlah Karyawan DevTI',
      tetap: totalTetap,
      prof: totalProf,
      tlh: totalTlh,
      magang: totalMagang,
      outsource: totalOutsource,
      total: totalAll
    };

    const combinedTableData = [...Object.values(summaryData).sort((a: any, b: any) => b.total - a.total)];

    return {
      tableData: combinedTableData,
      totalsRow,
      pieData
    };
  }),

  getAll: publicProcedure
    .input(
      yup.object({
        type: yup.string().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input.type && input.type !== 'All') {
        where.employeeType = { contains: input.type };
      }

      return ctx.db.employee.findMany({
        where,
        orderBy: {
          id: 'asc'
        }
      });
    }),

  getById: publicProcedure.input(yup.object({ id: yup.number().required() })).query(async ({ ctx, input }) => {
    return ctx.db.employee.findUnique({
      where: { id: input.id }
    });
  }),

  getOnboardingEmployees: publicProcedure.query(async ({ ctx }) => {
    // Sinkronisasi pelamar yang sudah lulus (PASSED) tapi belum ada di tabel Employee
    const passedApplicants = await ctx.db.applicant.findMany({
      where: { result: 'PASSED' }
    });

    for (const applicant of passedApplicants) {
      const existingEmployee = await ctx.db.employee.findFirst({
        where: { applicantId: applicant.id }
      });

      if (!existingEmployee) {
        await ctx.db.employee.create({
          data: {
            applicantId: applicant.id,
            firstName: applicant.firstName,
            lastName: applicant.lastName,
            startWorking: new Date(),
            status: 'ONBOARDING'
          }
        });
      }
    }

    return ctx.db.employee.findMany({
      where: {
        status: 'ONBOARDING'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true
      },
      orderBy: {
        id: 'asc'
      }
    });
  }),

  promoteToEmployee: publicProcedure
    .input(
      yup.object({
        employeeId: yup.number().required(),
        nip: yup.string().required(),
        jobDesc: yup.string().required(),
        previousPosition: yup.string().nullable(),
        currentPosition: yup.string().required(),
        startWorking: yup.string().required(), // Stored as ISO date string from client, but we will convert it
        employeeType: yup.string().required(),
        status: yup.string().required(),
        keteranganDate: yup.string().nullable()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const employee = await ctx.db.employee.update({
        where: { id: input.employeeId },
        data: {
          nip: input.nip,
          jobDesc: input.jobDesc,
          previousPosition: input.previousPosition || null,
          currentPosition: input.currentPosition,
          startWorking: new Date(input.startWorking),
          employeeType: input.employeeType,
          status: input.status,
          keteranganDate: input.keteranganDate || null
        }
      });
      return employee;
    }),

  delete: publicProcedure.input(yup.object({ id: yup.number().required() })).mutation(async ({ ctx, input }) => {
    // First delete related records if necessary, or let Prisma cascade if configured.
    // Assuming cascade is not fully configured for all relations, we might need to delete them or let Prisma handle it.
    // Since teamMembers, onboardingProgres, taskLists don't have cascade in schema, we need to delete them first
    await ctx.db.teamMember.deleteMany({ where: { employeeId: input.id } });
    await ctx.db.onboardingProgres.deleteMany({ where: { employeeId: input.id } });
    await ctx.db.taskList.deleteMany({ where: { employeeId: input.id } });

    return ctx.db.employee.delete({
      where: { id: input.id }
    });
  })
});
