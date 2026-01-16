import { FileX } from 'lucide-react'

export function WorkspaceEmpty() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center max-w-md px-4">
        <div className="rounded-full bg-muted p-3">
          <FileX className="h-8 w-8 text-muted-foreground" />
        </div>
        <span className="text-lg font-medium">No task assigned</span>
        <span className="text-sm text-muted-foreground">
          There are no tasks available for you at the moment.
        </span>
      </div>
    </div>
  )
}
