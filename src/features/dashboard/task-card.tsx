import { useNavigate } from 'react-router-dom'
import { Clock, User, ArrowRight, Trash2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/status-badge'
import type { Task } from '@/types'
import { formatDistanceToNow } from '@/lib/date-utils'

interface TaskCardProps {
  task: Task
  actionLabel?: string
  onAction?: (task: Task) => void
  onDelete?: (task: Task) => void
  showImage?: boolean
}

export function TaskCard({
  task,
  actionLabel = 'Open',
  onAction,
  onDelete,
  showImage = true,
}: TaskCardProps) {
  const navigate = useNavigate()

  const handleAction = () => {
    if (onAction) {
      onAction(task)
    } else {
      navigate('/workspace')
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(task)
  }

  return (
    <Card className="group overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
      {showImage && (
        <div className="relative h-32 overflow-hidden bg-muted">
          <img
            src={task.imageUrl}
            alt={`Task ${task.id}`}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-2 left-2">
            <StatusBadge status={task.status} />
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 bg-background/80 hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      <CardHeader className={showImage ? 'pt-3' : ''}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Task #{task.id.slice(-8)}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(task.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {!showImage && <StatusBadge status={task.status} />}
            {!showImage && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {task.noisyText.slice(0, 100)}...
        </p>
        {task.assignedToName && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
            <User className="h-3 w-3" />
            {task.assignedToName}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
          onClick={handleAction}
        >
          {actionLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

