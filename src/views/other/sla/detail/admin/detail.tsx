'use client'

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { api } from "trpc/react"
import MainCard from "components/MainCard"
import { useMemo } from "react"
import { ColumnDef } from '@tanstack/react-table';
import { Chip, Typography, Stack } from "@mui/material"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import TableContent from "components/table/TableContent"
import { useTableState } from "hooks/useTableState"
import { DebouncedInput } from "components/third-party/react-table"




interface ProjectDone {
    name: String;
    id: Number;
    description: String;
    createdAt: Date;
    status: String;
    startedAt: Date | null;
    dueDate: Date | null;
    completedAt: Date | null;
    requestId: number | null;
}

interface SlaApiResponse {
    slaDays: number | null;
    project: ProjectDone | null;
}

export function DetailView(){

    const params = useParams()
    const requestType = params.type
    const searchParams = useSearchParams()
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const query = searchParams.get('query');
    const router = useRouter()

    const slaStatus = [
        'ACHIEVED',
        'NOT ACHIEVED'
    ]

    const {data: sla, isLoading} = api.sla.getSlaByType.useQuery({
        type: requestType.toString(),
        limit: Number(limit) || 10,
        page: Number(page) || 1,
        search: query || '',
    })


    const columns = useMemo<ColumnDef<SlaApiResponse>[]>(
        () => [
          {
            header: () => 'ID',
            accessorKey: 'id',
            sortingFn: 'alphanumeric'
          },
          {
            header: () => 'Project Name',
            accessorKey: 'project.name',
            sortingFn: 'alphanumeric'
          },
          {
            header: () => 'Started At',
            accessorKey: 'startedAt',
            sortingFn: 'datetime',
            cell: ({ row }) => {
                const start = row.original.project?.startedAt
                if (!start) return '-';
              return new Date(start).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              });
            }
          },
          {
            header: () => 'Completed at',
            accessorKey: 'completedAt',
            sortingFn: 'datetime',
            cell: ({ row }) => {
                const complete = row.original.project?.completedAt
                if (!complete) return '-';
              return new Date(complete).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              });
            }
          },
          {
            header: () => 'Due Date',
            accessorKey: 'dueDate',
            sortingFn: 'datetime',
            cell: ({ row }) => {
                const due = row.original.project?.dueDate
                if (!due) return '-';
              return new Date(due).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              });
            }
          },
          {
            header: () => 'Status',
            accessorKey: 'slaStatus',
            sortingFn: 'alphanumeric',
            cell: ({row}) => {
                const due = row.original.project?.dueDate
                const completed = row.original.project?.completedAt
                if (!due) return '-';
                if (!completed) return '-';
                const isAchieve = completed.getTime() <= due.getTime()
                const currentStatus = isAchieve ? slaStatus[0] : slaStatus[1]

              return (
                <>
                    <Chip label={currentStatus} variant="filled" color={isAchieve ? "success" : "error"}></Chip>
                </>
              )
            }
          },
        ],
        []
      );

      const { table, setGlobalFilter } = useTableState<SlaApiResponse>({
          data: sla?.data,
          columns,
          isServerPagination: true
        });

    return(
        <>
            <div>
                <Link href="/sla" className="flex items-center gap-2">
                    <ArrowLeft />
                    <Typography variant="h5">
                        Back to SLA
                    </Typography>
                </Link>
            </div>
            <div className="flex flex-col gap-5 lg:grid lg:grid-cols-4">
                <MainCard title="Total Projects" sx={{ height: '100%' }}>
                    <Typography variant="h3">
                        {sla?.meta.totalData}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        Total Number of Projects
                    </Typography>
                </MainCard>
    
                <div className="bg-emerald-500 rounded-xl pl-1">
                    <MainCard title="Achieved Projects" sx={{ height: '100%' }}>
                        <Typography variant="h3">
                        {sla?.meta.totalAchieved}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            Total Achieved Projects
                        </Typography>
                    </MainCard>
                </div>
    
                <div className="bg-red-500 rounded-xl pl-1">
                    <MainCard title="Not Achieved Projects" sx={{ height: '100%' }}>
                        <Typography variant="h3">
                        {sla?.meta.totalNotAchieved}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            Total Not Achieved Projects
                        </Typography>
                    </MainCard>
                </div>  

                <div className="bg-blue-500 rounded-xl pl-1">
                    <MainCard title="Precentace" sx={{ height: '100%' }}>
                        <Typography variant="h3">
                        {sla?.meta.percentage}%
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            Percentage Achieved Projects
                        </Typography>
                    </MainCard>
                </div>  
            </div>
            <MainCard
                title={
                        <Stack sx={{ gap: 3 }}>
                        <Typography variant="h5">Service Type {requestType.toString().replace(/_/g, ' ')}</Typography>
                        <Stack direction="row" alignItems="center" spacing={{ xs: 0.75, sm: 2 }} justifyContent="space-between">
                            <Stack spacing={1} direction="row" alignItems="end">
                            <DebouncedInput value="" onFilterChange={(value) => setGlobalFilter(String(value))} placeholder="Search..." syncWithUrl />
                            </Stack>
                        </Stack>
                        </Stack>
                    }
                        content={false}
            >
                <TableContent<SlaApiResponse>
                            {...{
                            table,
                            isPending: isLoading,
                            isServerPagination: true,
                            onRowClick: (row) => {
                                router.push(`/project/detail/${row.original.project?.id}`)
                            }
                            }}
                        />
            </MainCard>
        </>
    )
}