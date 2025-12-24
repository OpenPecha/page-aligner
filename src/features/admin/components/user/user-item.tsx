import { useState } from 'react'
import { Edit, Trash2, Mail } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { UserRole, ROLE_CONFIG, type User, type Group } from '@/types'
import { useUpdateUser } from '../../api/user'
import { UserDialog } from './user-dialog'
import { DeleteUserDialog } from './delete-user-dialog'

interface UserItemProps {
  user: User
  groups: Group[]
}

export function UserItem({ user, groups }: UserItemProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const updateUser = useUpdateUser()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleRoleChange = async (newRole: string) => {
    if (newRole === user.role) return
    try {
      await updateUser.mutateAsync({
        username: user.username!,
        data: { new_role: newRole as UserRole },
      })
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const handleGroupChange = async (newGroup: string) => {
    if (newGroup === user.group) return
    try {
      await updateUser.mutateAsync({
        username: user.username!,
        data: { new_group: newGroup || undefined },
      })
    } catch (error) {
      console.error('Failed to update group:', error)
    }
  }

  return (
    <>
      <div className="grid grid-cols-[1fr_150px_150px_100px] gap-4 items-center p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0">
        {/* Name & Email */}
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={user.picture} alt={user.username} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {getInitials(user.username ?? '')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium truncate">{user.username}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{user.email}</span>
            </p>
          </div>
        </div>

        {/* Role Select */}
        <Select
          value={user.role}
          onValueChange={handleRoleChange}
          disabled={updateUser.isPending}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(UserRole).map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_CONFIG[role].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Group Select */}
        <Select
          value={user.group || ''}
          onValueChange={handleGroupChange}
          disabled={updateUser.isPending}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="-" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.name} value={group.name}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Actions */}
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4 text-primary" />
            <span className="sr-only">Edit user</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete user</span>
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <UserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={user}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={user}
      />
    </>
  )
}

export function UserItemSkeleton() {
  return (
    <div className="grid grid-cols-[1fr,150px,150px,80px] gap-4 items-center p-4 border-b border-border">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-8 w-full rounded-md" />
      <Skeleton className="h-8 w-full rounded-md" />
      <div className="flex justify-end gap-1">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  )
}

