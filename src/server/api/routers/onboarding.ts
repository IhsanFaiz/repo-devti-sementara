import * as yup from 'yup';
import { createTRPCRouter, publicProcedure } from 'server/api/trpc';

const MOCK_MODULES = [
  {
    id: 1,
    groupChecklist: 'Brief/Pengenalan Pertama',
    modulName: 'Melakukan pertemuan pertama atau pengenalan kerja',
    listChecklist: '',
    sourceInformation: 'Kepala Urusan'
  },
  {
    id: 2,
    groupChecklist: 'Brief/Pengenalan Pertama',
    modulName: 'Mengakses tools Onboarding & Training',
    listChecklist: '',
    sourceInformation: 'Kepala Urusan'
  },
  {
    id: 3,
    groupChecklist: 'Brief/Pengenalan Pertama',
    modulName: 'Mengakses Starter Kit dan Wiki PuTI',
    listChecklist: '',
    sourceInformation: 'TW Administrasi'
  },
  {
    id: 4,
    groupChecklist: 'Brief/Pengenalan Pertama',
    modulName: 'Telah masuk ke dalam grup Onboarding & Training dan sumber sudah memperkenalkan diri',
    listChecklist: '',
    sourceInformation: '--'
  },
  { id: 5, groupChecklist: 'Administrasi', modulName: 'Memenuhi berkas Administrasi', listChecklist: '', sourceInformation: '--' },
  {
    id: 6,
    groupChecklist: 'Introduction',
    modulName: 'Mengenal Profil Direktorat Pusat Teknologi Informasi, Universitas Telkom',
    listChecklist: '',
    sourceInformation: '--'
  },
  { id: 7, groupChecklist: 'Introduction', modulName: 'Mengetahui Job Desk Posisi Kerja', listChecklist: '', sourceInformation: '--' },
  {
    id: 8,
    groupChecklist: 'Introduction',
    modulName: 'Mengetahui Proses Bisnis Pengembangan Aplikasi',
    listChecklist: '',
    sourceInformation: '--'
  },
  {
    id: 9,
    groupChecklist: 'Introduction',
    modulName: 'Mengetahui Prosedur dan Instruksi Kerja pada Pengembangan Aplikasi',
    listChecklist: '',
    sourceInformation: '--'
  },
  {
    id: 10,
    groupChecklist: 'Introduction',
    modulName: 'Mengetahui Prosedur dan Instruksi Kerja Pengajuan Aplikasi',
    listChecklist: '',
    sourceInformation: '--'
  },
  { id: 11, groupChecklist: 'Introduction', modulName: 'Mengetahui DevTI Dashboard', listChecklist: '', sourceInformation: '--' },
  { id: 12, groupChecklist: 'Introduction', modulName: 'Mengenal Ruang kerja DevTI', listChecklist: '', sourceInformation: '--' },
  {
    id: 13,
    groupChecklist: 'Introduction',
    modulName: 'Telah masuk ke dalam grup besar PuTI pancen OYE dan sudah memperkenalkan diri secara tekstual dan menggunakan video',
    listChecklist: '',
    sourceInformation: '--'
  },
  {
    id: 14,
    groupChecklist: 'Introduction',
    modulName: 'Telah masuk ke dalam grup DevTeam dan sudah memperkenalkan diri',
    listChecklist: '',
    sourceInformation: '--'
  },
  {
    id: 15,
    groupChecklist: 'Introduction',
    modulName: 'Telah masuk ke dalam grup sesuai dengan posisi kerja dan sudah memperkenalkan diri',
    listChecklist: '',
    sourceInformation: '--'
  },
  {
    id: 16,
    groupChecklist: 'Team & Assigment',
    modulName: 'Mengetaui tim dan project mana kamu akan bekerja',
    listChecklist: '',
    sourceInformation: '--'
  },
  {
    id: 17,
    groupChecklist: 'Team & Assigment',
    modulName: 'Telah masuk ke dalam grup TMTlers (grup khusus pekerja dengan status Magang Tenaga Proyek)',
    listChecklist: '',
    sourceInformation: '--'
  },
  {
    id: 18,
    groupChecklist: 'Team & Assigment',
    modulName: 'Mengetahui Tata Cara pengisian Tasklist TLH',
    listChecklist: '',
    sourceInformation: '--'
  },
  {
    id: 19,
    groupChecklist: 'Team & Assigment',
    modulName: 'Telah mendapatkan akses mengisian Tasklist TLH',
    listChecklist: '',
    sourceInformation: '--'
  },
  {
    id: 20,
    groupChecklist: 'Administrasi',
    modulName: 'Konfirmasi ke TW Administrasi terkait pemberian Access Right',
    listChecklist: '',
    sourceInformation: '--'
  },
  {
    id: 21,
    groupChecklist: 'Training',
    modulName: 'Mengetahui Skema Training yang akan dijalani',
    listChecklist: '',
    sourceInformation: '--'
  },
  {
    id: 22,
    groupChecklist: 'Training',
    modulName: 'Mengetahui jadwal training yang akan dilaksanakan bersama trainer',
    listChecklist: '',
    sourceInformation: '--'
  }
];

export const onboardingRouter = createTRPCRouter({
  getChecklist: publicProcedure
    .input(
      yup.object({
        applicantId: yup.number().required()
      })
    )
    .query(async ({ ctx, input }) => {
      // 1. Seed ModulOnboarding if empty
      const moduleCount = await ctx.db.modulOnboarding.count();
      if (moduleCount === 0) {
        await ctx.db.modulOnboarding.createMany({
          data: MOCK_MODULES.map((m) => ({
            id: m.id,
            groupChecklist: m.groupChecklist,
            modulName: m.modulName,
            listChecklist: m.listChecklist,
            sourceInformation: m.sourceInformation
          }))
        });
      }

      // 2. Find or Create Employee based on applicantId
      let employee = await ctx.db.employee.findFirst({
        where: { applicantId: input.applicantId }
      });

      if (!employee) {
        const applicant = await ctx.db.applicant.findUnique({
          where: { id: input.applicantId }
        });

        if (!applicant) {
          throw new Error('Applicant not found');
        }

        employee = await ctx.db.employee.create({
          data: {
            applicantId: input.applicantId,
            firstName: applicant.firstName,
            lastName: applicant.lastName,
            startWorking: new Date(),
            status: 'ONBOARDING'
          }
        });
      }

      // 3. Get all modules
      const modules = await ctx.db.modulOnboarding.findMany({
        orderBy: { id: 'asc' }
      });

      // 4. Get current progress for this employee
      const progresses = await ctx.db.onboardingProgres.findMany({
        where: { employeeId: employee.id }
      });

      // Map progress to easy lookup
      const progressMap = progresses.reduce(
        (acc, curr) => {
          if (curr.modulId) {
            acc[curr.modulId] = curr.status;
          }
          return acc;
        },
        {} as Record<number, string>
      );

      // 5. Group modules exactly like the UI wants
      const groupedData: any[] = [];
      let currentGroup: any = null;

      modules.forEach((modul) => {
        if (!currentGroup || currentGroup.group !== modul.groupChecklist) {
          currentGroup = {
            group: modul.groupChecklist,
            items: []
          };
          groupedData.push(currentGroup);
        }

        currentGroup.items.push({
          id: modul.id,
          name: modul.modulName,
          checked: progressMap[modul.id] === 'COMPLETED',
          source: modul.sourceInformation || '--'
        });
      });

      return groupedData;
    }),

  updateProgress: publicProcedure
    .input(
      yup.object({
        applicantId: yup.number().required(),
        modulId: yup.number().required(),
        checked: yup.boolean().required()
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find Employee
      const employee = await ctx.db.employee.findFirst({
        where: { applicantId: input.applicantId }
      });

      if (!employee) {
        throw new Error('Employee not found for this applicant');
      }

      // Find if progress exists
      const existingProgress = await ctx.db.onboardingProgres.findFirst({
        where: {
          employeeId: employee.id,
          modulId: input.modulId
        }
      });

      const newStatus = input.checked ? 'COMPLETED' : 'PENDING';

      if (existingProgress) {
        return ctx.db.onboardingProgres.update({
          where: { id: existingProgress.id },
          data: { status: newStatus }
        });
      } else {
        return ctx.db.onboardingProgres.create({
          data: {
            employeeId: employee.id,
            modulId: input.modulId,
            status: newStatus
          }
        });
      }
    })
});
