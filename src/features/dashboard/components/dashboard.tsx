
import { useNavigate } from 'react-router-dom'
import { useGetAssignedTask } from '@/features/workspace/api'
import { useAuth } from '@/features/auth'
import {
  EmptyTaskState,
  TaskCard,
  TaskCardSkeleton,
  WelcomeHeader,
} from '@/features/dashboard'

export function Dashboard() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { data: task, isLoading } = useGetAssignedTask(currentUser?.username)

  if (!currentUser) return null

  const handleContinue = () => {
    navigate('/workspace')
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <WelcomeHeader user={currentUser} />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Current Task</h2>

        {isLoading ? (
          <TaskCardSkeleton />
        ) : !task ? (
          <EmptyTaskState />
        ) : (
          <TaskCard task={task} onContinue={handleContinue} />
        )}
      </div>
    </div>
  )
}
