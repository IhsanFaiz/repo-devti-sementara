'use client'

import Link from "next/link"
import { ArrowLeft, BadgeQuestionMark, CircleCheck } from "lucide-react"
import { Typography } from "@mui/material";
import { useParams } from "next/navigation";
import MainCard from "components/MainCard";
import { api } from "trpc/react";
import ProjectFieldInput from "components/ProjectFieldInput";

export function DetailView(){
    const params = useParams()
    const projectId = params.id

    // Mengambil utils untuk kebutuhan meng-invalidate cache data tRPC
    const utils = api.useUtils();

    // Query data fields
    const { data: projectField, isLoading } = api.projectField.getByProjectId.useQuery({
        projectId: Number(projectId)
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
                {/* Bagian kiri: Kolom Input Dinamis */}
                <div className="flex flex-col lg:col-span-2 gap-6">
                    {isLoading ? (
                        <div className="text-center p-5 text-zinc-400">Loading fields...</div>
                    ) : (
                        // PERBAIKAN: Menghapus MainCard pembungkus luar agar tiap item menggunakan MainCard miliknya sendiri
                        projectField?.map((field) => (
                            <ProjectFieldInput
                                key={field.id}
                                field={field}
                                existingValue={field.values?.[0]?.value}
                                onSave={async (fieldId, value) => {
                                    // PERBAIKAN: Kirim langsung variabel 'value' apa adanya.
                                    // Jangan lakukan pengecekan 'value instanceof File' lagi di sini,
                                    // karena string Base64 JSON sudah dihandle di dalam ProjectFieldInput.
                                    await saveField.mutateAsync({
                                        fieldId,
                                        value: value as string 
                                    });
                                }}
                            />
                        ))
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
                                <CircleCheck className="size-4 text-green-600"/>
                                Create a new project.
                            </Typography>
                            <Typography variant="h6" color="textSecondary" className="flex gap-2 items-center">
                                <CircleCheck className="size-4 text-green-600"/>
                                Add custom submission fields.
                            </Typography>
                            <Typography variant="h6" color="textSecondary" className="flex gap-2 items-center">
                                <CircleCheck className="size-4 text-green-600"/>
                                Members complete and submit the required data.
                            </Typography>
                            <Typography variant="h6" color="textSecondary" className="flex gap-2 items-center">
                                <CircleCheck className="size-4 text-green-600"/>
                                Review all submissions from the admin panel.
                            </Typography>
                        </div>
                    </MainCard>
                </div>
            </div>
        </>
    )
}