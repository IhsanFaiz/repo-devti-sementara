'use client'

import { useParams } from "next/navigation"
import { api } from "trpc/react"
import Link from "next/link"
import { ArrowLeft } from "iconsax-react"
import { Typography, Chip, Button } from "@mui/material"
import MainCard from "components/MainCard"
import { CircleCheck, Landmark  } from "lucide-react"

export function DetailView(){

    const params = useParams()
    const requestId = params.id

    const {data: request, isLoading}= api.request.getById.useQuery({
        id: Number(requestId)
    })

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
                        request?.status !== "APPROVED" ? (
                            <>
                            <div className="flex ml-auto gap-3">
                                <Button variant="shadow" color="error">
                                    Reject
                                </Button>
                                <Button variant="shadow" color="success">
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
                    
                </div>
                <div>
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
                    
                </div>
            </div>
        </>
    )
}