import { FileText } from 'lucide-react'

export function EmptyTaskState() {
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

