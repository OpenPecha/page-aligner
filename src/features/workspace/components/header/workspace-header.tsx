import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { HeaderSettingsModal } from './header-settings-modal'
import { useVirtualizedScrollDirection } from '../../hooks'
import type { AssignedTask } from '@/types/task'
import type { UserRole } from '@/types/user'
import { Menu } from 'lucide-react'
import logo from '@/assets/images/logo.png'

interface WorkspaceHeaderProps {
  task: AssignedTask
  userRole: UserRole | undefined
  isSubmitting?: boolean
  onSubmit: () => void
  onTrash: () => void
  onApprove: () => void
  onReject: () => void
  scrollContainerRef: React.RefObject<HTMLElement | null>
}

/**
 * Workspace header with hide-on-scroll behavior.
 * Contains the app logo (linked to dashboard) and settings menu button.
 */
export function WorkspaceHeader({
  task,
  userRole,
  isSubmitting,
  onSubmit,
  onTrash,
  onApprove,
  onReject,
  scrollContainerRef,
}: WorkspaceHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  const { isVisible } = useVirtualizedScrollDirection(scrollContainerRef)

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'fixed left-0 right-0 top-0 z-50 transition-transform duration-300 ease-out',
          isVisible ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        {/* Header bar with refined glass effect */}
        <div className="relative overflow-hidden border-b border-border/40 bg-background/80 backdrop-blur-xl">
          {/* Subtle gradient accent line at top */}

          <div className="relative flex h-14 items-center justify-between px-4 sm:px-6">
            {/* Logo & App Name - Links to Dashboard */}
            <Link
              to="/dashboard"
              className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-all active:scale-[0.98]"
              aria-label="Go to Dashboard"
            >
              <img src={logo} alt="Page Aligner" className="h-9 w-9 drop-shadow-sm transition-transform group-hover:scale-105" />
              <div className="flex flex-col">
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  Page Aligner
                </span>
              </div>
            </Link>

            {/* Hamburger Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsModalOpen(true)}
              className="h-10 w-10 rounded-lg bg-background/80 shadow-sm backdrop-blur-sm transition-all hover:bg-background/90 hover:shadow-md active:scale-95"
              aria-label="Open settings menu"
            >
              <Menu className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      {/* Animated spacer - collapses when header hides */}
      <div
        className={cn(
          'flex-shrink-0 transition-all duration-300 ease-out',
          isVisible ? 'h-14' : 'h-0'
        )}
      />

      {/* Settings Modal */}
      <HeaderSettingsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        task={task}
        userRole={userRole}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onTrash={onTrash}
        onApprove={onApprove}
        onReject={onReject}
      />
    </>
  )
}
