import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Users,
  Layers,
  Package,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Sun,
  Moon,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth'
import { useUIStore, type Theme, type Language } from '@/store/use-ui-store'
import { UserRole, ROLE_CONFIG } from '@/types'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { getInitials } from '@/lib/utils'

const themeOptions: { value: Theme; icon: React.ElementType }[] = [
  { value: 'system', icon: Monitor },
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
]

const languageOptions: { value: Language; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'bo', label: 'BO' },
]

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
    roles: [UserRole.Admin, UserRole.Annotator, UserRole.Reviewer, UserRole.FinalReviewer],
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
    roles: [UserRole.Admin],
  },
  {
    label: 'Groups',
    href: '/admin/groups',
    icon: Layers,
    roles: [UserRole.Admin],
  },
  {
    label: 'Batches',
    href: '/admin/batches',
    icon: Package,
    roles: [UserRole.Admin],
  },
]

export function Sidebar() {
  const { currentUser, logout } = useAuth()
  const { sidebarCollapsed, toggleSidebar, theme, setTheme, language, setLanguage } = useUIStore()
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (!currentUser) return null

  const filteredNavItems = navItems.filter((item) =>
    currentUser.role && item.roles.includes(currentUser.role)
  )

  const handleLogout = () => {
    logout()
  }

  const toggleSettings = () => {
    setSettingsOpen((prev) => !prev)
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

      {/* User Profile & Settings */}
      <div className="p-2">
        {/* Settings Panel - Animated */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-out',
            settingsOpen ? 'max-h-40 opacity-100 mb-2' : 'max-h-0 opacity-0'
          )}
        >
          <div className="flex flex-col gap-2 rounded-lg bg-sidebar-accent/50 p-2">
            {/* Language Toggle */}
            <div className="flex items-center justify-start">
              <div className="flex items-center gap-1 rounded-full bg-sidebar-accent p-1">
                {languageOptions.map((lang) => {
                  const isSelected = language === lang.value
                  return (
                    <button
                      key={lang.value}
                      onClick={() => setLanguage(lang.value)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200',
                        isSelected
                          ? 'bg-sidebar text-sidebar-foreground'
                          : 'text-muted-foreground hover:text-sidebar-foreground'
                      )}
                    >
                      {lang.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-start">
              <div className="flex items-center gap-1 rounded-full bg-sidebar-accent p-1">
                {themeOptions.map((themeOpt) => {
                  const Icon = themeOpt.icon
                  const isSelected = theme === themeOpt.value
                  return (
                    <button
                      key={themeOpt.value}
                      onClick={() => setTheme(themeOpt.value)}
                      className={cn(
                        'p-2 rounded-full transition-all duration-200',
                        isSelected
                          ? 'bg-sidebar text-sidebar-foreground'
                          : 'text-muted-foreground hover:text-sidebar-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        </div>

        {/* Profile Row */}
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg p-2',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={currentUser.picture} alt={currentUser.username} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(currentUser.username ?? 'No Name')}
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
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 shrink-0 text-muted-foreground hover:text-sidebar-foreground transition-transform duration-200',
              settingsOpen && 'rotate-90'
            )}
            onClick={toggleSettings}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
