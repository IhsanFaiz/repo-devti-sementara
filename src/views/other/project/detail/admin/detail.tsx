'use client';

import { api } from 'trpc/react';
import { useParams } from 'next/navigation';
import { Typography } from '@mui/material';
import { ArrowLeft, BadgeQuestionMark, CircleCheck, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import MainCard from 'components/MainCard';
import { Chip, Skeleton, Button } from '@mui/material';
import { useState } from 'react';
import TableModal from 'sections/table/TableModalField';
import TableModalAssign from 'sections/table/TableModalAssign';
import ProjectFieldValue from 'components/ProjectFieldValue';
import AlertItemDelete from 'sections/table/AlertItemDeleteField';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

export interface ProjectFieldApiResponse {
  id: number;
  projectId: number;
  label: string;
  type: string;
  required: boolean;
  placeholder: string | null;
  createdAt: Date;
}

export function DetailView() {
  const [fieldModal, setFieldModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedField, setSelectedField] = useState<ProjectFieldApiResponse | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const params = useParams();
  const projectId = params.id;
  const utils = api.useUtils();

  const { data: project, isLoading } = api.project.getById.useQuery({
    id: Number(projectId)
  });

  const { data: projectField } = api.projectField.getByProjectId.useQuery({
    projectId: Number(projectId)
  });

  const markAsDone = api.project.markAsDone.useMutation({
    onSuccess: () => {
      utils.project.invalidate();
      utils.project.getById.invalidate({
        id: Number(projectId)
      });
      utils.sla.invalidate();

      openSnackbar({
        open: true,
        message: 'Project Done.',
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
    },
    onError: () => {
      openSnackbar({
        open: true,
        message: 'Something is wrong.',
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
    }
  });

  const handleDone = async () => {
    await markAsDone.mutateAsync({
      id: Number(projectId)
    });
  };

  const startProject = api.project.startProject.useMutation({
    onSuccess: () => {
      utils.project.invalidate();
      utils.project.getById.invalidate({
        id: Number(projectId)
      });

      openSnackbar({
        open: true,
        message: 'Project has been started.',
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
    },
    onError: () => {
      openSnackbar({
        open: true,
        message: 'Something is wrong.',
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
    }
  });

  const handleEdit = (field: ProjectFieldApiResponse) => {
    setSelectedField(field);
    setFieldModal(true);
  };

  const handleDelete = (field: ProjectFieldApiResponse) => {
    setSelectedField(field);
    setDeleteModal(true);
  };

  const hadleAssign = async () => {
    if (project?.projectMembers.length === 0) {
      openSnackbar({
        open: true,
        message: 'Cannot start project. No members have been assigned yet.',
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
      return;
    } else {
      await startProject.mutateAsync({
        id: Number(projectId)
      });
    }
  };

  const assignOpenModal = () => {
    setAssignModal(true);
  };

  return (
    <>
      <div>
        <Link href="/project" className="flex items-center gap-2">
          <ArrowLeft />
          <Typography variant="h5">Back to projects</Typography>
        </Link>
      </div>
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
        <div className="flex flex-col lg:col-span-2 gap-8">
          {isLoading ? (
            <MainCard>
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <Skeleton animation="wave" variant="text" width={250} height={40} />
                    <Skeleton animation="wave" variant="rounded" width={90} height={32} />
                  </div>

                  <Skeleton animation="wave" variant="text" width="100%" />
                  <Skeleton animation="wave" variant="text" width="80%" />
                </div>

                <div className="flex gap-2 mt-2">
                  <Skeleton animation="wave" variant="rounded" width={100} height={32} />
                  <Skeleton animation="wave" variant="rounded" width={120} height={32} />
                  <Skeleton animation="wave" variant="rounded" width={90} height={32} />
                </div>
                <div className="flex gap-2 mt-2">
                  <Skeleton animation="wave" variant="rounded" width={200} height={32} />
                </div>
              </div>
            </MainCard>
          ) : (
            <MainCard>
              <div className="flex flex-col gap-5">
                <div>
                  <div className="flex items-center justify-between">
                    <Typography variant="h3">{project?.name}</Typography>

                    <Chip
                      label={project?.status}
                      color={
                        project?.status === 'ACTIVE'
                          ? 'success'
                          : project?.status === 'DONE'
                            ? 'default'
                            : project?.status === 'WAITING'
                              ? 'warning'
                              : 'error'
                      }
                    />
                  </div>

                  <Typography className="max-w-xl mt-3" sx={{ whiteSpace: 'pre-line' }} variant="h6" color="textSecondary">
                    {project?.description}
                  </Typography>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 mt-2">
                    {project?.projectMembers.length ? (
                      project.projectMembers.map((member) => (
                        <Chip key={member.userId} label={member.user.username} color="primary" variant="outlined" />
                      ))
                    ) : (
                      <Chip label="No members assigned to this project" color="default" variant="outlined" />
                    )}
                  </div>
                  <div className="flex items-start justify-between w-full">
                    <Button onClick={assignOpenModal} variant="contained" color="secondary" className="flex gap-2">
                      <PlusCircle />
                      Assign Member to this Project
                    </Button>
                  </div>
                </div>
              </div>
            </MainCard>
          )}

          <MainCard>
            <div className="flex items-center justify-between">
              <Typography variant="h4" className="flex items-center gap-2">
                All Project Field
              </Typography>
              <Button
                onClick={() => {
                  setSelectedField(null);
                  setFieldModal(true);
                }}
                variant="contained"
                color="primary"
                className="flex items-center gap-2"
              >
                <PlusCircle />
                Add field
              </Button>
            </div>
            <div className="mt-5">
              {isLoading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="border border-gray-700 rounded-lg p-4 flex flex-col gap-2">
                      <Skeleton animation="wave" variant="text" width={200} height={32} />
                      <Skeleton animation="wave" variant="text" width="100%" />
                      <Skeleton animation="wave" variant="rounded" width="100%" height={80} />
                    </div>
                  ))}
                </div>
              ) : !projectField?.length ? (
                <div className="border border-dashed border-gray-700 rounded-lg p-10 text-center">
                  <Typography variant="h5" color="textSecondary">
                    No fields created yet
                  </Typography>

                  <Typography variant="body2" color="textSecondary" className="mt-2">
                    Add your first project field to start collecting submissions.
                  </Typography>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {projectField.map((field) => {
                    const value = field.values?.[0];
                    console.log(value);
                    return (
                      <ProjectFieldValue
                        key={field.id}
                        field={field}
                        value={value?.value ?? null}
                        fileUrl={value?.value ?? null}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </MainCard>
          <div className="ml-auto">
            {isLoading ? (
              <>
                <Skeleton animation="wave" variant="rounded" width={110} height={35} />
              </>
            ) : (
              <>
                {project?.status !== 'WAITING' ? (
                  <>
                    <Button variant="contained" disabled color="success">
                      Start Project
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={hadleAssign} disabled={startProject.isPending} variant="shadow" color="success">
                      Start Project
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <MainCard>
            <Typography variant="h4" className="flex items-center gap-2">
              <BadgeQuestionMark />
              Guide
            </Typography>
            <div className="flex flex-col gap-3 mt-5">
              <Typography variant="h6" color="textSecondary" className="flex gap-2 items-center">
                <CircleCheck className="size-4" />
                Create a new project.
              </Typography>
              <Typography variant="h6" color="textSecondary" className="flex gap-2 items-center">
                <CircleCheck className="size-4" />
                Add custom submission fields.
              </Typography>
              <Typography variant="h6" color="textSecondary" className="flex gap-2 items-center">
                <CircleCheck className="size-4" />
                Members complete and submit the required data.
              </Typography>
              <Typography variant="h6" color="textSecondary" className="flex gap-2 items-center">
                <CircleCheck className="size-4" />
                Review all submissions from the admin panel.
              </Typography>
            </div>
          </MainCard>
          <MainCard>
            <Typography variant="h4">Timeline</Typography>

            {isLoading ? (
              <Timeline sx={{ '& .MuiTimelineItem-root:before': { flex: 0, padding: 0 } }} className="mt-5">
                {[1, 2, 3].map((item) => (
                  <TimelineItem key={item}>
                    <TimelineSeparator>
                      <TimelineDot variant="outlined" color="primary" />
                      {item < 3 && <TimelineConnector />}
                    </TimelineSeparator>

                    <TimelineContent>
                      <Skeleton variant="rounded" width={200} height={20} />
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            ) : project?.startedAt ? (
              <Timeline sx={{ '& .MuiTimelineItem-root:before': { flex: 0, padding: 0 } }} className="mt-5">
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot variant="outlined" color="primary" />
                    <TimelineConnector />
                  </TimelineSeparator>

                  <TimelineContent>
                    <Chip
                      label={`Started at ${project.startedAt.toLocaleString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}`}
                      variant="combined"
                      color="info"
                    />
                  </TimelineContent>
                </TimelineItem>

                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot variant="outlined" color="primary" />
                    <TimelineConnector />
                  </TimelineSeparator>

                  <TimelineContent>
                    <Chip
                      label={`Due date ${project.dueDate?.toLocaleString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}`}
                      variant="combined"
                      color="error"
                    />
                  </TimelineContent>
                </TimelineItem>

                {project.status === 'DONE' && (
                  <TimelineItem sx={{ minHeight: 'auto' }}>
                    <TimelineSeparator>
                      <TimelineDot variant="outlined" color="primary" />
                    </TimelineSeparator>

                    <TimelineContent>
                      <Chip
                        label={`Completed at ${project.completedAt?.toLocaleString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}`}
                        variant="combined"
                        color="success"
                      />
                    </TimelineContent>
                  </TimelineItem>
                )}
              </Timeline>
            ) : (
              <Chip className="mt-5" label="Project has not started yet" variant="filled" color="default" />
            )}
          </MainCard>
          {isLoading ? (
            <Skeleton
              variant="rounded"
              sx={{
                width: '100%',
                height: 42,
                borderRadius: 1
              }}
            />
          ) : (
            <Button
              onClick={handleDone}
              disabled={project?.status !== 'ACTIVE' || markAsDone.isPending}
              variant="contained"
              color="success"
              fullWidth
            >
              Mark As Done
            </Button>
          )}
        </div>
      </div>
      <AlertItemDelete item={selectedField} open={deleteModal} handleClose={() => setDeleteModal(false)} />
      <TableModal open={fieldModal} modalToggler={setFieldModal} item={selectedField} projectId={Number(projectId)} />
      <TableModalAssign open={assignModal} modalToggler={setAssignModal} projectId={Number(projectId)} />
    </>
  );
}
