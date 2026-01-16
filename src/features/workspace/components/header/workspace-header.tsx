import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { HeaderSettingsModal } from './header-settings-modal'
import { useVirtualizedScrollDirection } from '../../hooks'
import type { AssignedTask } from '@/types/task'
import type { UserRole } from '@/types/user'
import { Menu } from 'lucide-react'

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
 * Custom logo component inspired by Tibetan manuscript aesthetics.
 * Features a stylized pecha (Tibetan book) design.
 */
function AppLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F4D03F" />
          <stop offset="50%" stopColor="#E67E22" />
          <stop offset="100%" stopColor="#C0392B" />
        </linearGradient>
        <linearGradient id="logoPaper" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDFEFE" />
          <stop offset="100%" stopColor="#F5EEF8" />
        </linearGradient>
        <linearGradient id="logoInk" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1A1A2E" />
          <stop offset="100%" stopColor="#16213E" />
        </linearGradient>
      </defs>

      {/* Background circle with Tibetan-inspired border */}
      <circle cx="20" cy="20" r="19" fill="url(#logoGold)" stroke="#8B0000" strokeWidth="1" />
      
      {/* Inner decorative ring */}
      <circle cx="20" cy="20" r="15" fill="none" stroke="#FFF8DC" strokeWidth="0.5" opacity="0.6" />
      
      {/* Stylized pecha (Tibetan book) shape */}
      <rect x="8" y="11" width="24" height="18" rx="2" fill="url(#logoPaper)" stroke="#5D4E37" strokeWidth="0.6" />
      
      {/* Horizontal lines representing text */}
      <line x1="11" y1="16" x2="29" y2="16" stroke="url(#logoInk)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="11" y1="20" x2="26" y2="20" stroke="url(#logoInk)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="11" y1="24" x2="28" y2="24" stroke="url(#logoInk)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      
      {/* Small alignment indicator */}
      <rect x="26" y="22" width="5" height="5" rx="1" fill="#27AE60" opacity="0.9" />
      <path d="M27.5 24.5 L28.5 25.5 L30 23.5" stroke="white" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
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
              <AppLogo className="h-9 w-9 drop-shadow-sm transition-transform group-hover:scale-105" />
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
