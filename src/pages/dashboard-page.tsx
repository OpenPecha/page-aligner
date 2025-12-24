import { TaskList } from '@/features/dashboard'
import { useGetTasks } from '@/features/admin/api/task'
import { useAuth } from '@/features/auth'
import { UserRole, TaskStatus, ROLE_CONFIG } from '@/types'

export function DashboardPage() {
  const { currentUser } = useAuth()
  const { data: recentTasks, isLoading } = useGetTasks(currentUser?.username)
  console.log("recentTasks", recentTasks)

  const tasks = recentTasks?.slice(0, 8) || []

  if (!currentUser) return null

  const roleConfig = currentUser.role ? ROLE_CONFIG[currentUser.role] : null

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

      {/* Stats Overview */}

      {/* Quick Actions based on role */}
      {currentUser.role === UserRole.Annotator && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Active Tasks</h2>
          <TaskList
            tasks={tasks.filter(t => 
              t.assignedTo === currentUser.id && 
              (t.status === TaskStatus.InProgress || t.status === TaskStatus.Rejected)
            )}
            isLoading={isLoading}
            emptyMessage="No active tasks. Check with your admin for new assignments."
            actionLabel="Continue"
          />
        </div>
      )}

      {currentUser.role === UserRole.Reviewer && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Tasks Awaiting Review</h2>
          <TaskList
            tasks={tasks.filter(t => 
              t.status === TaskStatus.AwaitingReview || 
              (t.status === TaskStatus.InReview && t.reviewerId === currentUser.id)
            )}
            isLoading={isLoading}
            emptyMessage="No tasks awaiting review."
            actionLabel="Review"
          />
        </div>
      )}

      {currentUser.role === UserRole.FinalReviewer && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Tasks Awaiting Final Review</h2>
          <TaskList
            tasks={tasks.filter(t => 
              t.status === TaskStatus.AwaitingFinalReview || 
              (t.status === TaskStatus.FinalReview && t.finalReviewerId === currentUser.id)
            )}
            isLoading={isLoading}
            emptyMessage="No tasks awaiting final review."
            actionLabel="Final Review"
          />
        </div>
      )}

      {currentUser.role === UserRole.Admin && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            emptyMessage="No tasks in the system yet."
            actionLabel="View"
          />
        </div>
      )}
    </div>
  )
}
