import { ROLE_CONFIG, type User } from '@/types'

interface WelcomeHeaderProps {
  user: User
}

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  const roleConfig = user.role ? ROLE_CONFIG[user.role] : null

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome back, {user.username}
      </h1>
      {roleConfig && (
        <p className="text-muted-foreground mt-1">
          {roleConfig.description}
        </p>
      )}
    </div>
  )
}

