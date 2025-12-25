import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { userSchema, type UserFormData } from '@/schema/user-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserRole, ROLE_CONFIG, type Group } from '@/types'

export interface UserFormProps {
  defaultValues?: Partial<UserFormData>
  groups: Group[]
  onSubmit: (data: UserFormData) => void
  isSubmitting?: boolean
  submitLabel?: string
  isEditMode?: boolean
}

export function UserForm({
  defaultValues,
  groups,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Create',
  isEditMode = false,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: defaultValues?.username ?? '',
      email: defaultValues?.email ?? '',
      role: defaultValues?.role ?? UserRole.Annotator,
      group: defaultValues?.group ?? '',
    },
  })

  const selectedRole = watch('role')
  const selectedGroup = watch('group')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">User name</Label>
        <Input
          id="username"
          placeholder="Enter user name"
          {...register('username')}
          disabled={isSubmitting}
        />
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter user email"
          {...register('email')}
          disabled={isSubmitting || isEditMode}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={selectedRole}
          onValueChange={(value) => setValue('role', value as UserRole)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(UserRole).map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_CONFIG[role].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="group">Group</Label>
        <Select
          value={selectedGroup}
          onValueChange={(value) => setValue('group', value)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="group">
            <SelectValue placeholder="Select group" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.name} value={group.name}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.group && (
          <p className="text-sm text-destructive">{errors.group.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

