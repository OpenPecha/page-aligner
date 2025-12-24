import {
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth'
import { UserRole } from '@/types'

interface StatCardProps {
  title: string
  value: number
  icon: React.ElementType
  description?: string
  color?: string
}

function StatCard({ title, value, icon: Icon, description, color }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

export function StatsOverview() {
  const { currentUser } = useAuth()

  const isAnnotator = currentUser?.role === UserRole.Annotator

  const { data: dashboardStats, isLoading: isDashboardLoading } = useGetDashboardStats()
  const { data: annotatorStats, isLoading: isAnnotatorLoading } = useGetAnnotatorStats(
    isAnnotator ? currentUser?.id ?? '' : ''
  )

  const stats = isAnnotator ? annotatorStats : dashboardStats
  const isLoading = isAnnotator ? isAnnotatorLoading : isDashboardLoading

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  // Different stat cards based on role
  if (isAnnotator) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={PlayCircle}
          description="Tasks you're working on"
          color="text-primary"
        />
        <StatCard
          title="Under Review"
          value={stats.awaitingReview}
          icon={Clock}
          description="Submitted for review"
          color="text-warning"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          description="Successfully approved"
          color="text-success"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          description="Needs rework"
          color="text-destructive"
        />
      </div>
    )
  }

  // Admin / Reviewer / Final Reviewer view
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Total Tasks"
        value={stats.total}
        icon={FileText}
        description="All tasks in system"
      />
      <StatCard
        title="Pending"
        value={stats.pending}
        icon={Clock}
        description="Awaiting assignment"
        color="text-muted-foreground"
      />
      <StatCard
        title="In Progress"
        value={stats.inProgress}
        icon={PlayCircle}
        description="Being transcribed"
        color="text-primary"
      />
      <StatCard
        title="In Review"
        value={stats.awaitingReview}
        icon={Loader2}
        description="Under review"
        color="text-warning"
      />
      <StatCard
        title="Completed"
        value={stats.completed}
        icon={CheckCircle2}
        description="Gold standard"
        color="text-success"
      />
    </div>
  )
}
