import { useNavigate } from 'react-router-dom'
import { ArrowRight, FileText, Layers } from 'lucide-react'
import { useGetTask } from '@/features/admin/api/task'
import { useAuth } from '@/features/auth'
import { ROLE_CONFIG } from '@/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

const STATE_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  annotating: { label: 'Annotating', variant: 'default' },
  submitted: { label: 'Submitted', variant: 'secondary' },
  reviewing: { label: 'In Review', variant: 'outline' },
  completed: { label: 'Completed', variant: 'secondary' },
  trashed: { label: 'Trashed', variant: 'destructive' },
}

function TaskCardSkeleton() {
  return (
    <Card className="max-w-2xl">
      <Skeleton className="h-48 w-full rounded-t-lg" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
  )
}

function EmptyTaskState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <FileText className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Tasks Available</h3>
      <p className="text-muted-foreground max-w-sm">
        You don't have any tasks assigned at the moment. Check back later or contact your admin for new assignments.
      </p>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { data: task, isLoading } = useGetTask(currentUser?.username ?? '')

  if (!currentUser) return null

  const roleConfig = currentUser.role ? ROLE_CONFIG[currentUser.role] : null
  const stateConfig = task?.state ? STATE_CONFIG[task.state] : null

  const handleContinue = () => {
    navigate('/workspace')
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {currentUser.username}
        </h1>
        {roleConfig && (
          <p className="text-muted-foreground mt-1">
            {roleConfig.description}
          </p>
        )}
      </div>

      {/* Current Task */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Current Task</h2>
        
        {isLoading ? (
          <TaskCardSkeleton />
        ) : !task ? (
          <EmptyTaskState />
        ) : (
          <Card className="max-w-2xl overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg">
            {/* Task Image */}
            <div className="relative h-48 overflow-hidden bg-muted">
              <img
                src={task.task_url}
                alt={task.task_name}
                className="h-full w-full object-contain bg-black/5"
                loading="lazy"
              />
              <div className="absolute top-3 right-3">
                {stateConfig && (
                  <Badge variant={stateConfig.variant}>
                    {stateConfig.label}
                  </Badge>
                )}
              </div>
            </div>

            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" title={task.task_name}>
                    {task.task_name}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-4 w-4" />
                      {task.batch_name}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Transcript</p>
                <p className="text-sm bg-muted/50 p-3 rounded-md font-mono leading-relaxed">
                  {task.task_transcript}
                </p>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <Button
                onClick={handleContinue}
                className="w-full sm:w-auto"
                size="lg"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
