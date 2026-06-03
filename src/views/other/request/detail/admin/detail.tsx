'use client'

import { useParams } from "next/navigation"
import { api } from "trpc/react"
import Link from "next/link"
import { ArrowLeft } from "iconsax-react"
import { Typography } from "@mui/material"
import MainCard from "components/MainCard"
import { CircleCheck, BadgeQuestionMark } from "lucide-react"

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