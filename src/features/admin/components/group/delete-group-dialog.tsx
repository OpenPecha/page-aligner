import { useState } from 'react'
import { AlertTriangle, Loader2, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteGroup } from '../../api/group'
import type { Group, User } from '@/types'

interface DeleteGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: Group | null
  usersInGroup: User[]
}

export function DeleteGroupDialog({
  open,
  onOpenChange,
  group,
  usersInGroup,
}: DeleteGroupDialogProps) {
  const deleteGroup = useDeleteGroup()
  const [error, setError] = useState<string | null>(null)

  const hasUsers = usersInGroup.length > 0
  const isDeleting = deleteGroup.isPending

  const handleDelete = async () => {
    if (!group || hasUsers) return

    setError(null)

    try {
      await deleteGroup.mutateAsync(group.id)
      onOpenChange(false)
    } catch (err) {
      setError('Failed to delete group. Please try again.')
      console.error('Failed to delete group:', err)
    }
  }

  if (!group) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Group
          </DialogTitle>
          <DialogDescription>
            {hasUsers
              ? 'This group cannot be deleted because it has users assigned.'
              : `Are you sure you want to delete "${group.name}"? This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>

        {hasUsers && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50 p-4">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {usersInGroup.length} user{usersInGroup.length > 1 ? 's' : ''} assigned
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Please reassign or remove all users from this group before deleting.
                </p>
                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  Users: {usersInGroup.slice(0, 3).map(u => u.username).join(', ')}
                  {usersInGroup.length > 3 && ` and ${usersInGroup.length - 3} more`}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={hasUsers || isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

