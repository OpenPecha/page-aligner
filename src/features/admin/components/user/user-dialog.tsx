import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserForm } from './user-form'
import { useCreateUser, useUpdateUser } from '../../api/user'
import { useGetGroups } from '../../api/group'
import type { User } from '@/types'
import type { UserFormData } from '@/schema/user-schema'

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
}

export function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const { data: groups = [] } = useGetGroups()

  const isEditing = !!user
  const isSubmitting = createUser.isPending || updateUser.isPending

  const handleSubmit = async (data: UserFormData) => {
    try {
      if (isEditing && user) {
        await updateUser.mutateAsync({
          username: user.username,
          data: {
            ...(data.username ? { new_username: data.username } : {}),
            ...(data.email ? { new_email: data.email } : {}),
            ...(data.role ? { new_role: data.role } : {}),
            ...(data.group ? { new_group: data.group } : {}),
          },
        })
      } else {
        await createUser.mutateAsync({
          username: data.username,
          email: data.email,
          role: data?.role,
          group: data?.group,
        })
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save user:', error)
    }
  }

  const defaultValues: Partial<UserFormData> | undefined = user
    ? {
        username: user.username,
        email: user.email,
        role: user.role,
        group: user.group ?? '',
      }
    : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the user details below.'
              : 'Fill in the details to add a new user.'}
          </DialogDescription>
        </DialogHeader>

        <UserForm
          key={user?.username ?? 'new'}
          defaultValues={defaultValues}
          groups={groups}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={isEditing ? 'Update' : '+ Create'}
          isEditMode={isEditing}
        />
      </DialogContent>
    </Dialog>
  )
}

