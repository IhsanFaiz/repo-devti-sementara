'use client'

import { useParams } from "next/navigation"
import { api } from "trpc/react"
import Link from "next/link"
import { ArrowLeft } from "iconsax-react"
import { Typography, Chip, Button, Skeleton } from "@mui/material"
import MainCard from "components/MainCard"
import { Landmark  } from "lucide-react"
import { openSnackbar } from "api/snackbar"
import { SnackbarProps } from "types/snackbar"
import { useRouter } from "next/navigation"

export function DetailView(){

    const params = useParams()
    const requestId = params.id
    const utils = api.useUtils()
    const router = useRouter()

    

    const {data: request, isLoading}= api.request.getById.useQuery({
        id: Number(requestId)
    })

    const navToProject = () => {
        router.push(`/project/detail/${request?.project?.id}`)
    }

    const approveMutation = api.request.approve.useMutation({
        onSuccess: () => {
            utils.request.getById.invalidate({
                id: Number(requestId)
            })
            openSnackbar({
                open: true,
                message: 'App Request Approved.',
                variant: 'alert',
                alert: {
                    color: 'success'
                }
            } as SnackbarProps);
        },
        onError: (ctx) => {
            openSnackbar({
            open: true,
            message: ctx.message || 'Error approve app request.',
            variant: 'alert',
            alert: {
                color: 'error'
            }
            } as SnackbarProps);
            console.error('Error Approved app request:', ctx.message);
        }
    })

    const rejectMutation = api.request.reject.useMutation({
        onSuccess: () => {
            utils.request.getById.invalidate({
            id: Number(requestId)
            });
            openSnackbar({
                open: true,
                message: 'App Request Rejected.',
                variant: 'alert',
                alert: {
                    color: 'success'
                }
            } as SnackbarProps);
        },
        onError: (ctx) => {
            openSnackbar({
            open: true,
            message: ctx.message || 'Error Rejected app request.',
            variant: 'alert',
            alert: {
                color: 'error'
            }
            } as SnackbarProps);
            console.error('Error Rejected app request:', ctx.message);
        }
    });

    const handleApproved = async () => {
        await utils.request.invalidate();
        await approveMutation.mutateAsync({
            id: Number(requestId)
        })
    }

    const handleRejected = async () => {
        await utils.request.invalidate();
        await rejectMutation.mutateAsync({
            id: Number(requestId)
        })
    }

    return(
        <>
            <div>
                <Link href="/request" className="flex items-center gap-2">
                    <ArrowLeft />
                    <Typography variant="h5">
                        Back to App Requests
                    </Typography>
                </Link>
            </div>
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
                <div className="flex flex-col lg:col-span-2 gap-8">
                    {isLoading ? (
                        <>
                            <MainCard>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <Typography variant="h4">
                                            <Skeleton variant="text" width={220} animation="wave" />
                                        </Typography>
                                        <Skeleton variant="rounded" width={100} height={32} animation="wave" />
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <Skeleton variant="rounded" width={80} height={32} animation="wave" />
                                        <Skeleton variant="rounded" width={90} height={32} animation="wave" />
                                    </div>
                                    
                                    <div className="flex gap-2 flex-wrap">
                                        <Skeleton variant="rounded" width={60} height={28} animation="wave" />
                                        <Skeleton variant="rounded" width={75} height={28} animation="wave" />
                                        <Skeleton variant="rounded" width={90} height={28} animation="wave" />
                                        <Skeleton variant="rounded" width={85} height={28} animation="wave" />
                                        <Skeleton variant="rounded" width={50} height={28} animation="wave" />
                                        <Skeleton variant="rounded" width={80} height={28} animation="wave" />
                                    </div>
                                </div>
                            </MainCard>
                            <MainCard>
                                <div className="flex flex-col gap-3">
                                    <Typography variant="h4">
                                        <Skeleton variant="text" width={180} animation="wave" />
                                    </Typography>
                                    <div>
                                        <Skeleton variant="text" width="100%" animation="wave" />
                                        <Skeleton variant="text" width="95%" animation="wave" />
                                        <Skeleton variant="text" width="40%" animation="wave" />
                                    </div>
                                </div>
                            </MainCard>

                            <div className="flex ml-auto gap-3">
                                <Skeleton variant="rounded" width={90} height={36} animation="wave" />
                                <Skeleton variant="rounded" width={90} height={36} animation="wave" />
                            </div>
                        </>
                    ): (
                        <>
                            <MainCard>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <Typography variant="h4">
                                            {request?.references}
                                        </Typography>
                                        <Chip label={request?.status} color={request?.status === "APPROVED" ? "success" : request?.status === "PENDING" ? "default" : "error" }></Chip>
                                    </div>
                                    <div className="flex gap-3">
                                        <Chip label={request?.priority} color={request?.priority === "MEDIUM" ? "warning" : request?.priority === "LOW" ? "default" : "error" }></Chip>
                                        <Chip label={request?.slaDays + " days"} color="success"></Chip>
                                    </div>
                                    <div className="flex gap-2">
                                        <Chip variant="outlined" label={request?.via} color="primary"></Chip>
                                        <Chip variant="outlined" label={request?.psal} color="primary"></Chip>
                                        <Chip variant="outlined" label={request?.framework} color="primary"></Chip>
                                        <Chip variant="outlined" label={request?.groupType} color="primary"></Chip>
                                        <Chip variant="outlined" label={"v" + request?.version} color="primary"></Chip>
                                        <Chip variant="outlined" label={request?.category} color="primary"></Chip>
                                    </div>
                                </div>
                            </MainCard>
                            <MainCard>
                                <div className="flex flex-col gap-3">
                                    <Typography variant="h4">Feature & Description</Typography>
                                    <Typography sx={{ whiteSpace: 'pre-line' }}>{request?.description}</Typography>
                                </div>
                            </MainCard>
                            {
                                request?.status === "PENDING" ? (
                                    <>
                                    <div className="flex ml-auto gap-3">
                                        <Button onClick={handleRejected} disabled={rejectMutation.isPending} variant="shadow" color="error">
                                            Reject
                                        </Button>
                                        <Button onClick={handleApproved} disabled={approveMutation.isPending} variant="shadow" color="success">
                                            Approve
                                        </Button>
                                    </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex ml-auto gap-3">
                                            <Button disabled variant="contained" color="secondary">
                                                Reject
                                            </Button>
                                            <Button disabled variant="contained" color="secondary">
                                                Approve
                                            </Button>
                                        </div>
                                    </>
                                )
                            }
                        </>
                    )}
                </div>
                <div>
                    {
                        isLoading ? (
                            <>
                                <MainCard>
                                    <Skeleton 
                                        variant="rounded" 
                                        width="100%" 
                                        height={52} // Menyesuaikan tinggi Button bawaan MUI + Typography h4
                                        animation="wave" 
                                    />
                                    
                                    <div className="flex flex-col gap-3 mt-7">
                                        <div className="flex flex-col gap-1">
                                            <Typography variant="h5">
                                                <Skeleton variant="text" width={80} animation="wave" />
                                            </Typography>
                                            <Typography variant="h5">
                                                <Skeleton variant="text" width={150} animation="wave" />
                                            </Typography>
                                        </div>
                                        
                                        <div className="flex flex-col gap-1">
                                            <Typography variant="h5">
                                                <Skeleton variant="text" width={110} animation="wave" />
                                            </Typography>
                                            <Typography variant="h5">
                                                <Skeleton variant="text" width={200} animation="wave" />
                                            </Typography>
                                        </div>
                                        
                                        <div className="flex flex-col gap-1">
                                            <Typography variant="h5">
                                                <Skeleton variant="text" width={140} animation="wave" />
                                            </Typography>
                                            <Typography variant="h5">
                                                <Skeleton variant="text" width={180} animation="wave" />
                                            </Typography>
                                        </div>
                                    </div>
                                </MainCard>
                            </>
                        ) : (
                            <>
                                <MainCard>
                                    <Button variant="contained" color="secondary" className="w-full text-start justify-start">
                                        <Typography variant="h4" className="flex items-center gap-5">
                                            <Landmark />
                                            Department {request?.department}
                                        </Typography>
                                    </Button>
                                    <div className="flex flex-col gap-3 mt-7">
                                        <div className="flex flex-col">
                                            <Typography variant="h5" color="textSecondary">
                                                <span>Category</span>
                                            </Typography>
                                            <Typography variant="h5" >
                                                <span>{request?.category}</span>
                                            </Typography>
                                        </div>
                                        <div className="flex flex-col">
                                            <Typography variant="h5" color="textSecondary">
                                                <span>Service Type</span>
                                            </Typography>
                                            <Typography variant="h5" >
                                                <span>{request?.serviceType}</span>
                                            </Typography>
                                        </div>
                                        <div className="flex flex-col">
                                            <Typography variant="h5" color="textSecondary">
                                                <span>Sub Service Type</span>
                                            </Typography>
                                            <Typography variant="h5" >
                                                <span>{request?.subServiceType}</span>
                                            </Typography>
                                        </div>
                                    </div>
                                </MainCard>
                                {
                                    request?.status === "APPROVED" ? (
                                        <Button className="flex mt-5 w-full" onClick={navToProject} variant="contained">
                                            See in project
                                        </Button>
                                    ) : (
                                        <>
                                        <Button disabled className="flex mt-5 w-full" variant="contained">
                                            See in project
                                        </Button>
                                        </>
                                    )
                                }
                            </>
                        )
                    }
                </div>
            </div>
        </>
    )
}