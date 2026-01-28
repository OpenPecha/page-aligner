import { AlertTriangle } from 'lucide-react'

interface WorkspaceErrorProps {
  message?: string
}

export function WorkspaceError({ message = 'An unexpected error occurred' }: WorkspaceErrorProps) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center max-w-md px-4">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <span className="text-lg font-medium text-destructive">Error loading task</span>
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    </div>
  )
}
