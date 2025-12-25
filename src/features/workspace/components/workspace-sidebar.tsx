import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Diamond, LogOut, RefreshCw, FileText, Folder, Users, AlertCircle, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import type { AssignedTask } from '@/types'
import { getInitials } from '@/lib/utils'

interface WorkspaceSidebarProps {
  task: AssignedTask | null
  onRefresh?: () => void
  isLoading?: boolean
  hasUnsavedChanges?: boolean
}

// Status color configuration
const getStateColor = (state: string): string => {
  switch (state) {
    case 'annotating':
      return 'text-primary fill-primary'
    case 'submitted':
    case 'reviewing':
      return 'text-warning fill-warning'
    case 'completed':
      return 'text-success fill-success'
    case 'trashed':
      return 'text-destructive fill-destructive'
    default:
      return 'text-muted-foreground'
  }
}


export function WorkspaceSidebar({
  task,
  onRefresh,
  isLoading,
  hasUnsavedChanges = false,
}: WorkspaceSidebarProps) {
  const { currentUser, logout } = useAuth()

  const handleLogout = useCallback(() => {
    logout()
  }, [logout])

  if (!currentUser) return null

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
            <Diamond className="h-5 w-5 text-primary" />
          </div>
          <span className="font-semibold text-lg text-sidebar-foreground">Text Aligner</span>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="p-2">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <LayoutDashboard className="h-5 w-5 shrink-0" />
          <span>Dashboard</span>
        </Link>
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Current Task Info */}
      <div className="flex-1 overflow-y-auto p-4">
        {task ? (
          <div className="space-y-4">
            {/* Task Header */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
                Current Task
              </h3>
              
              {/* Task Name */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-sidebar-accent">
                <FileText className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground break-all truncate">
                    {task.task_name}
                  </p>
                  <div className={cn(
                    'flex items-center gap-1 mt-1 text-xs',
                    getStateColor(task.state)
                  )}>
                  </div>
                </div>
              </div>
            </div>

            {/* Batch Info */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
                Batch
              </h3>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-sidebar-accent/50">
                <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-sm text-sidebar-foreground truncate">
                  {task.batch_name}
                </p>
              </div>
            </div>

            {/* Group Info */}
            {task.group && task.group !== 'string' && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
                  Group
                </h3>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-sidebar-accent/50">
                  <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-sm text-sidebar-foreground truncate">
                    {task.group}
                  </p>
                </div>
              </div>
            )}

            {/* Unsaved Changes Warning */}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
                <p className="text-xs text-warning">
                  You have unsaved changes
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Diamond className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No task assigned</p>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="mt-2"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Get Task
              </Button>
            )}
          </div>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      {/* User Profile */}
      <div className="p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <Avatar className="h-10 w-10 shrink-0 ring-2 ring-success">
            <AvatarImage src={currentUser.picture} alt={currentUser.username ?? ''} />
            <AvatarFallback className="bg-success text-success-foreground text-sm font-semibold">
              {getInitials(currentUser.username ?? 'No Name')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {currentUser.username}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {currentUser.role ? `${currentUser.role}` : 'No Role'}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
