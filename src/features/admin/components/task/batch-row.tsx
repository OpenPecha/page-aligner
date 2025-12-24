import { Trash2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BatchStatusBar } from './batch-status-bar'
import type { Task } from '@/types'

export interface BatchData {
  batchName: string
  groupId: string
  groupName: string
  tasks: Task[]
}

interface BatchRowProps {
  batch: BatchData
  onDelete: (batch: BatchData) => void
}

export function BatchRow({ batch, onDelete }: BatchRowProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 hover:bg-accent/5 transition-colors">
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Batch Name */}
        <div className="col-span-3 flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium truncate" title={batch.batchName}>
            {batch.batchName}
          </span>
        </div>

        {/* Group Name */}
        <div className="col-span-2">
          <span className="text-sm text-muted-foreground truncate block" title={batch.groupName}>
            {batch.groupName}
          </span>
        </div>

        {/* Status Progress Bar */}
        <div className="col-span-6">
          <BatchStatusBar tasks={batch.tasks} />
        </div>

        {/* Actions */}
        <div className="col-span-1 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(batch)}
            title="Delete batch"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function BatchRowSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-3">
          <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="col-span-2">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        </div>
        <div className="col-span-6">
          <div className="h-6 w-full bg-muted rounded animate-pulse" />
        </div>
        <div className="col-span-1" />
      </div>
    </div>
  )
}

