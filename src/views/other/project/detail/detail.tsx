'use client'

import { api } from "trpc/react";
import { useParams } from "next/navigation";
import { Typography } from "@mui/material";
import { ArrowLeft, BadgeQuestionMark, CircleCheck, PlusCircle } from "lucide-react";
import Link from "next/link";
import MainCard from "components/MainCard";
import { Chip, Skeleton, Button } from "@mui/material";


export function DetailView(){

    const params = useParams()
    const projectId = params.id

    const { data: project, isLoading } = api.project.getById.useQuery({
        id: Number(projectId)
    });

    return(
        <>
            <div>
                <Link href="/project" className="flex items-center gap-2">
                    <ArrowLeft />
                    <Typography variant="h5">
                        Back to projects
                    </Typography>
                </Link>
            </div>
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
                <div className="flex flex-col lg:col-span-2 gap-8">
                    {isLoading ? (
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
                    ) : (
                    <MainCard>
                        <div className="flex flex-col gap-5">
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

                        <div>
                            <div className="flex gap-2 mt-2">
                            {project?.projectMembers.length ? (
                                project.projectMembers.map((member) => (
                                <Chip
                                    key={member.userId}
                                    label={member.user.username}
                                    color="primary"
                                />
                                ))
                            ) : (
                                <Chip
                                label="No members assigned to this project"
                                color="default"
                                />
                            )}
                            </div>
                        </div>
                        </div>
                    </MainCard>
                    )}

                    <MainCard>
                        <div className="flex items-center justify-between">
                            <Typography variant="h4" className="flex items-center gap-2">
                                All Project Input
                            </Typography>
                            <Button variant="contained" color="success" className="flex items-center gap-2">
                                <PlusCircle />
                                Add field
                            </Button>
                        </div>
                        <div className="mt-5">
                            
                        </div>
                    </MainCard>
                </div>
                <div>
                    <MainCard>
                        <Typography variant="h4" className="flex items-center gap-2">
                            <BadgeQuestionMark />
                            Guide
                        </Typography>
                        <div className="flex flex-col gap-3 mt-5">
                            <Typography variant="h6" color="textSecondary" className="flex gap-2 items-center">
                                <CircleCheck className="size-4"/>
                                Create a new project.
                            </Typography>
                            <Typography variant="h6" color="textSecondary" className="flex gap-2 items-center">
                                <CircleCheck className="size-4"/>
                                Add custom submission fields.
                            </Typography>
                            <Typography variant="h6" color="textSecondary" className="flex gap-2 items-center">
                                <CircleCheck className="size-4"/>
                                Members complete and submit the required data.
                            </Typography>
                            <Typography variant="h6" color="textSecondary" className="flex gap-2 items-center">
                                <CircleCheck className="size-4"/>
                                Review all submissions from the admin panel.
                            </Typography>
                        </div>
                    </MainCard>
                </div>
            </div>
        </>
    )
}