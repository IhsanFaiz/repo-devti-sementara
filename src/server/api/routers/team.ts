import * as yup from 'yup';
import { createTRPCRouter, publicProcedure } from 'server/api/trpc';

export const teamRouter = createTRPCRouter({
  createTeamProject: publicProcedure
    .input(
      yup.object({
        teamName: yup.string().required(),
        project: yup.string().required(),
        employeeIds: yup.array().of(yup.number().required()).required()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        // Create the Team
        const team = await tx.team.create({
          data: {
            teamName: input.teamName
          }
        });

        // Add Team Members
        if (input.employeeIds.length > 0) {
          await tx.teamMember.createMany({
            data: input.employeeIds.map((id) => ({
              teamId: team.id,
              employeeId: id
            }))
          });
        }

        // Create the Project
        const project = await tx.project.create({
          data: {
            name: input.project,
            description: `Project for ${input.teamName}`
          }
        });

        // Link Team to Project
        await tx.teamProject.create({
          data: {
            teamId: team.id,
            projectId: project.id
          }
        });

        return { team, project };
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.teamProject.findMany({
      include: {
        team: {
          include: {
            teamMembers: {
              include: {
                employee: true
              }
            }
          }
        },
        project: true
      }
    });
  }),

  getById: publicProcedure.input(yup.object({ id: yup.number().required() })).query(async ({ ctx, input }) => {
    return ctx.db.teamProject.findUnique({
      where: { id: input.id },
      include: {
        team: {
          include: {
            teamMembers: true
          }
        },
        project: true
      }
    });
  }),

  updateTeamProject: publicProcedure
    .input(
      yup.object({
        id: yup.number().required(),
        teamName: yup.string().required(),
        project: yup.string().required(),
        employeeIds: yup.array().of(yup.number().required()).required()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        // Find existing team project
        const teamProject = await tx.teamProject.findUnique({
          where: { id: input.id },
          include: { team: true, project: true }
        });

        if (!teamProject) throw new Error('TeamProject not found');
        if (!teamProject.teamId || !teamProject.projectId) throw new Error('Invalid TeamProject relations');

        // Update Team Name
        await tx.team.update({
          where: { id: teamProject.teamId },
          data: { teamName: input.teamName }
        });

        // Update Project Name
        await tx.project.update({
          where: { id: teamProject.projectId },
          data: { name: input.project, description: `Project for ${input.teamName}` }
        });

        // Update Team Members
        // Delete all current members for the team
        await tx.teamMember.deleteMany({
          where: { teamId: teamProject.teamId }
        });

        // Add new members
        if (input.employeeIds.length > 0) {
          await tx.teamMember.createMany({
            data: input.employeeIds.map((empId) => ({
              teamId: teamProject.teamId!,
              employeeId: empId
            }))
          });
        }

        return teamProject;
      });
    }),

  deleteTeamProject: publicProcedure.input(yup.object({ id: yup.number().required() })).mutation(async ({ ctx, input }) => {
    return ctx.db.$transaction(async (tx) => {
      const teamProject = await tx.teamProject.findUnique({
        where: { id: input.id }
      });

      if (!teamProject) throw new Error('TeamProject not found');
      if (!teamProject.teamId || !teamProject.projectId) throw new Error('Invalid TeamProject relations');

      // Delete the link
      await tx.teamProject.delete({
        where: { id: input.id }
      });

      // Delete Team Members
      await tx.teamMember.deleteMany({
        where: { teamId: teamProject.teamId }
      });

      // Delete Team
      await tx.team.delete({
        where: { id: teamProject.teamId }
      });

      // Delete Project
      await tx.project.delete({
        where: { id: teamProject.projectId }
      });

      return true;
    });
  })
});
