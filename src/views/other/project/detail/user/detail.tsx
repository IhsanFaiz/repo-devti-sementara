'use client'

import Link from "next/link"
import { ArrowLeft, BadgeQuestionMark, CircleCheck } from "lucide-react"
import { Typography } from "@mui/material";
import { useParams } from "next/navigation";
import MainCard from "components/MainCard";
import { api } from "trpc/react";
import { Chip } from "@mui/material";
import ProjectFieldInput from "components/ProjectFieldInput";
import {Skeleton} from "@mui/material";

export function DetailView(){
    const params = useParams()
    const projectId = params.id

    // Mengambil utils untuk kebutuhan meng-invalidate cache data tRPC
    const utils = api.useUtils();

    // Query data fields
    const { data: projectField, isLoading } = api.projectField.getByProjectId.useQuery({
        projectId: Number(projectId)
    });

    const {data: project } = api.project.getById.useQuery({
        id: Number(projectId)
    });


    // Perbaikan: Tambahkan invalidasi otomatis setelah data berhasil dibuat/di-update
    const saveField = api.projectFieldValue.create.useMutation({
        onSuccess: () => {
            utils.projectField.getByProjectId.refetch();
        }
    });

    return(
        <>
            <div className="mb-4">
                <Link href="/my-project" className="flex items-center gap-2 w-fit">
                    <ArrowLeft />
                    <Typography variant="h5">
                        Back to my projects
                    </Typography>
                </Link>
            </div>
            
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
                <div className="flex flex-col lg:col-span-2 gap-6">
                    {isLoading ? (
                        <>
                        <MainCard>
                            <div className="flex flex-col gap-5">
                                <div>
                                    <div className="flex items-center justify-between">
                                    <Skeleton variant="text" width={250} height={40} />
                                    <Skeleton variant="rounded" width={90} height={32} />
                                    </div>

                                    <Skeleton variant="text" width="100%" />
                                    <Skeleton variant="text" width="80%" />
                                </div>

                                <div className="flex gap-2 mt-2">
                                    <Skeleton variant="rounded" width={100} height={32} />
                                    <Skeleton variant="rounded" width={120} height={32} />
                                    <Skeleton variant="rounded" width={90} height={32} />
                                </div>
                            </div>
                        </MainCard>
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="border border-gray-700 rounded-lg p-4 flex flex-col gap-2"
                                >
                                    <Skeleton variant="text" width={200} height={32} />
                                    <Skeleton variant="text" width="100%" />
                                    <Skeleton variant="rounded" width="100%" height={80} />
                                </div>
                            ))}
                        </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-5">
                            <MainCard>
                                <div>
                                    <div className="flex items-center justify-between">
                                    <Typography variant="h3">
                                        {project?.name}
                                    </Typography>

                                    <Chip
                                        label={project?.status}
                                        color={
                                        project?.status === "ACTIVE"
                                            ? "success"
                                            : project?.status === "DONE"
                                            ? "default"
                                            : "error"
                                        }
                                    />
                                    </div>

                                    <Typography variant="h6" color="textSecondary">
                                        {project?.description}
                                    </Typography>
                                </div>
                            </MainCard>
                            {
                                projectField?.map((field) => (
                                    <ProjectFieldInput
                                        key={field.id}
                                        field={field}
                                        existingValue={field.values?.[0]?.value}
                                        onSave={async (fieldId, value) => {
                                            await saveField.mutateAsync({
                                                fieldId,
                                                value: value as string 
                                            });
                                        }}
                                    />
                                ))
                            }
                        </div>
                    )}
                </div>
                
                {/* Bagian kanan: Guide Panel */}
                <div className="h-fit">
                    <MainCard>
                        <Typography variant="h4" className="flex items-center gap-2">
                            <BadgeQuestionMark />
                            Guide
                        </Typography>
                        <div className="flex flex-col gap-3 mt-5">
                            <Typography variant="h6" color="textSecondary" className="flex gap-2 items-center">
                                <CircleCheck className="size-4"/>
                                Open your assigned project.
                            </Typography>
                            <Typography variant="h6" color="textSecondary" className="flex gap-2 items-center">
                                <CircleCheck className="size-4"/>
                                Review the required submission fields.
                            </Typography>
                            <Typography variant="h6" color="textSecondary" className="flex gap-2 items-center">
                                <CircleCheck className="size-4"/>
                                Complete all requested information.
                            </Typography>
                            <Typography variant="h6" color="textSecondary" className="flex gap-2 items-center">
                                <CircleCheck className="size-4"/>
                                Submit your response.
                            </Typography>
                        </div>
                    </MainCard>
                </div>
            </div>
        </>
    )
}