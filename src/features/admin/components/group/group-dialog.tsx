import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GroupForm, type GroupFormData } from './group-form'
import { useCreateGroup, useUpdateGroup } from '../../api/group'
import type { Group } from '@/types'

interface GroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: Group | null // If provided, we're editing; otherwise creating
}

export function GroupDialog({ open, onOpenChange, group }: GroupDialogProps) {
  const createGroup = useCreateGroup()
  const updateGroup = useUpdateGroup()

  const isEditing = !!group
  const isSubmitting = createGroup.isPending || updateGroup.isPending

  const handleSubmit = async (data: GroupFormData) => {
    try {
      if (isEditing && group) {
        await updateGroup.mutateAsync({
          name: group.name,
          data: {
            new_name: data.name,
            new_description: data.description || '',
          },
        })
      } else {
        await createGroup.mutateAsync({
          name: data.name,
          description: data.description || '',
        })
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save group:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Group' : 'Create Group'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the group details below.'
              : 'Fill in the details to create a new group.'}
          </DialogDescription>
        </DialogHeader>

        <GroupForm
          defaultValues={
            group
              ? { name: group.name, description: group.description }
              : undefined
          }
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={isEditing ? 'Update Group' : 'Create Group'}
        />
      </DialogContent>
    </Dialog>
  )
}

