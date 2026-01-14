import { useTranslation } from 'react-i18next'
import { CheckCircle, Type, Layers, XCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { UserContribution } from '@/types'

interface UserReportSummaryProps {
  contributions: UserContribution[]
  isLoading: boolean
}

export function UserReportSummary({ contributions, isLoading }: UserReportSummaryProps) {
  const { t } = useTranslation('admin')

  if (isLoading) {
    return <UserReportSummarySkeleton />
  }

  const tasksCompleted = contributions.length
  const totalChars = contributions.reduce((sum, item) => sum + item.char_diff, 0)
  const batchesWorked = new Set(contributions.map((item) => item.batch_name)).size
  const rejectionCount = contributions.reduce((sum, item) => sum + item.rejection_count, 0)

  const stats = [
    {
      icon: CheckCircle,
      value: tasksCompleted,
      label: t('users.report.summary.tasksCompleted'),
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      icon: Type,
      value: totalChars.toLocaleString(),
      label: t('users.report.summary.totalChars'),
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      icon: Layers,
      value: batchesWorked,
      label: t('users.report.summary.batchesWorked'),
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      icon: XCircle,
      value: rejectionCount,
      label: `${t('users.report.summary.rejectionCount')}`,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-950/30',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`flex flex-col items-center justify-center rounded-lg p-4 ${stat.bg}`}
        >
          <stat.icon className={`h-5 w-5 ${stat.color} mb-1`} />
          <span className="text-xl font-bold">{stat.value}</span>
          <span className="text-xs text-muted-foreground text-center">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}

function UserReportSummarySkeleton() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col items-center justify-center rounded-lg bg-muted/50 p-4">
          <Skeleton className="h-5 w-5 mb-1" />
          <Skeleton className="h-6 w-12 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

