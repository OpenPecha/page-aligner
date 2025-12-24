import { useState, useMemo } from 'react'
import { Upload, Package, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useGetTask } from '../../api/task'
import { useGetGroups } from '../../api/group'
import { BatchRow, BatchRowSkeleton, type BatchData } from './batch-row'
import { DeleteBatchDialog } from './delete-batch-dialog'
import { TaskUploadDialog } from '../task/task-upload-dialog'

export function BatchList() {
  const { data: tasks = [], isLoading: tasksLoading } = useGetTask('') ?? []
  const { data: groups = [], isLoading: groupsLoading } = useGetGroups()
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [deleteBatch, setDeleteBatch] = useState<BatchData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const isLoading = tasksLoading || groupsLoading

  // Group tasks by batchName and enrich with group info
  const batches = useMemo(() => {
    const groupMap = new Map(groups.map((g) => [g.id, g]))
    const batchMap = new Map<string, BatchData>()
    return []
    tasks?.forEach((task) => {
      const batchKey = task.batchName || 'Unassigned'
      
      if (!batchMap.has(batchKey)) {
        const group = task.groupId ? groupMap.get(task.groupId) : null
        batchMap.set(batchKey, {
          batchName: batchKey,
          groupId: task.groupId || '',
          groupName: group?.name || 'Unknown Group',
          tasks: [],
        })
      }

      batchMap.get(batchKey)!.tasks.push(task)
    })

    // Sort batches by name
    return Array.from(batchMap.values()).sort((a, b) =>
      a.batchName.localeCompare(b.batchName)
    )
  }, [tasks, groups])

  const handleDeleteClick = (batch: BatchData) => {
    setDeleteBatch(batch)
    setDeleteDialogOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Task Batches
            </CardTitle>
            <CardDescription className="mt-1.5">
              Manage and monitor task batches across groups
            </CardDescription>
          </div>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Add Tasks
          </Button>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 pb-3 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="col-span-3">Batch Name</div>
            <div className="col-span-2">Group</div>
            <div className="col-span-6">Status</div>
            <div className="col-span-1" />
          </div>

          {/* Content */}
          <div className="pt-4 space-y-3">
            {isLoading ? (
              [...Array(4)].map((_, i) => <BatchRowSkeleton key={i} />)
            ) : batches.length === 0 ? (
              <EmptyState onUploadClick={() => setUploadDialogOpen(true)} />
            ) : (
              batches.map((batch) => (
                <BatchRow
                  key={batch.batchName}
                  batch={batch}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <TaskUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />

      {/* Delete Batch Dialog */}
      <DeleteBatchDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        batch={deleteBatch}
      />
    </>
  )
}

function EmptyState({ onUploadClick }: { onUploadClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Package className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">No batches yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        Upload your first batch of tasks to get started with annotation.
      </p>
      <Button onClick={onUploadClick} className="mt-4" size="sm">
        <Upload className="mr-2 h-4 w-4" />
        Upload Tasks
      </Button>
    </div>
  )
}

