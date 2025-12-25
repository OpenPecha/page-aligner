import { Mail } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { UserRole, ROLE_CONFIG, type User } from '@/types'
import { useUpdateUserRole } from '../../api/user'
import { getInitials } from '@/lib/utils'

interface GroupUserListProps {
  users: User[]
  groupId: string
  isLoading?: boolean
}

function UserRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
      <Skeleton className="h-8 w-28" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-muted-foreground">
        No users in this group yet.
      </p>
    </div>
  )
}

export function GroupUserList({ users, groupId, isLoading }: GroupUserListProps) {
  const updateUserRole = useUpdateUserRole()

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole.mutateAsync({
        userId,
        role: newRole,
        groupId,
      })
    } catch (error) {
      console.error('Failed to update user role:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="divide-y divide-border">
        {[...Array(3)].map((_, i) => (
          <UserRowSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="divide-y divide-border">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.picture} alt={user.username} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(user.username ?? 'No Name')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{user.username}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Mail className="h-3 w-3" />
                {user.email}
              </p>
            </div>
          </div>

          <Select
            value={user.role}
            onValueChange={(value) => handleRoleChange(user.id!, value as UserRole)}
            disabled={updateUserRole.isPending}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                <SelectItem key={role} value={role} className="text-xs">
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  )
}

