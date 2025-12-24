import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Shield,
  Users,
  Layers,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth'
import { useUIStore } from '@/store/use-ui-store'
import { UserRole, ROLE_CONFIG } from '@/types'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: [UserRole.Admin],
  },
  {
    label: 'Workspace',
    href: '/workspace',
    icon: FileText,
    roles: [UserRole.Annotator, UserRole.Reviewer, UserRole.FinalReviewer],
  },
  {
    label: 'Review Queue',
    href: '/review',
    icon: CheckSquare,
    roles: [UserRole.Reviewer],
  },
  {
    label: 'Final Review',
    href: '/final-review',
    icon: Shield,
    roles: [UserRole.FinalReviewer],
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
    roles: [UserRole.Admin],
  },
  {
    label: 'Tasks',
    href: '/admin/tasks',
    icon: FileText,
    roles: [UserRole.Admin],
  },
  {
    label: 'Groups',
    href: '/admin/groups',
    icon: Layers,
    roles: [UserRole.Admin],
  },
]

export function Sidebar() {
  const { currentUser, logout } = useAuth()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  if (!currentUser) return null

  const filteredNavItems = navItems.filter((item) =>
    currentUser.role && item.roles.includes(currentUser.role)
  )

  const handleLogout = () => {
    logout()
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo / Brand */}
      <div className="flex h-16 items-center justify-between px-4">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">TextAlign</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-sidebar-foreground"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                sidebarCollapsed && 'justify-center px-2'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <Separator className="bg-sidebar-border" />

      {/* User Profile */}
      <div className="p-2">
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg p-2',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={currentUser.picture} alt={currentUser.username} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {currentUser.username}
            </AvatarFallback>
          </Avatar>
          {!sidebarCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {currentUser.username}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {currentUser.role ? ROLE_CONFIG[currentUser.role]?.label : ''}
              </p>
            </div>
          )}
        </div>

        <div className={cn('mt-2 flex gap-1', sidebarCollapsed && 'flex-col')}>
          <Button
            variant="ghost"
            size={sidebarCollapsed ? 'icon' : 'sm'}
            className="flex-1 justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  )
}
