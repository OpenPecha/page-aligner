import {
  User,
  FileText,
  Settings2,
  Type,
  Zap,
  LogOut,
  Loader2,
  Trash2,
  Send,
  Check,
  X,
  AlertCircle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { LanguageToggle } from '@/components/common/language-toggle'
import { useAuth } from '@/features/auth'
import { useUIStore } from '@/store/use-editor-store'
import { FONT_FAMILIES, FONT_SIZES } from '../../constants'
import { UserRole, ROLE_CONFIG } from '@/types/user'
import type { AssignedTask } from '@/types/task'

interface HeaderSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: AssignedTask
  userRole: UserRole | undefined
  isSubmitting?: boolean
  onSubmit: () => void
  onTrash: () => void
  onApprove: () => void
  onReject: () => void
}

// Status badge variant mapping
const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  annotating: 'default',
  submitted: 'secondary',
  reviewing: 'warning',
  finalising: 'warning',
  completed: 'success',
  trashed: 'destructive',
}

/**
 * Settings modal with profile, task details, localization, theme, font settings, and actions.
 */
export function HeaderSettingsModal({
  open,
  onOpenChange,
  task,
  userRole,
  isSubmitting,
  onSubmit,
  onTrash,
  onApprove,
  onReject,
}: HeaderSettingsModalProps) {
  const { t } = useTranslation('workspace')
  const { currentUser, logout } = useAuth()

  // UI Store for font settings
  const editorFontFamily = useUIStore((state) => state.editorFontFamily)
  const editorFontSize = useUIStore((state) => state.editorFontSize)
  const setEditorFontFamily = useUIStore((state) => state.setEditorFontFamily)
  const setEditorFontSize = useUIStore((state) => state.setEditorFontSize)

  // Role-based action visibility
  const isAnnotator = userRole === UserRole.Annotator
  const isReviewer = userRole === UserRole.Reviewer
  const isFinalReviewer = userRole === UserRole.FinalReviewer

  const showAnnotatorActions = isAnnotator && task.state === 'annotating'
  const showReviewerActions = isReviewer && task.state === 'reviewing'
  const showFinalReviewerActions = isFinalReviewer && task.state === 'finalising'

  const handleLogout = () => {
    onOpenChange(false)
    logout()
  }

  const handleAction = (action: () => void) => {
    action()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-base font-semibold">Settings</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto">
          {/* Profile Section */}
          <section className="px-5 py-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              Profile
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {currentUser?.username?.charAt(0).toUpperCase() ||
                    currentUser?.email?.charAt(0).toUpperCase() ||
                    'U'}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {currentUser?.username || currentUser?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentUser?.role ? ROLE_CONFIG[currentUser.role]?.label : 'No Role'}
                  </p>
                </div>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="h-8 cursor-pointer gap-1.5 px-3 text-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          </section>

          <div className="border-t" />

          {/* Task Detail Section */}
          <section className="px-5 py-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Task Detail
            </h3>

            <div className="space-y-2.5">
              {/* Task ID - full width for lengthy IDs */}
              <div className="rounded-lg border bg-muted/30 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Task ID</p>
                <p className="truncate font-mono text-xs" title={task.task_id}>
                  {task.task_id}
                </p>
              </div>

              {/* Status & Volume in one row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border bg-muted/30 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Status</p>
                  <Badge variant={STATUS_VARIANTS[task.state] || 'secondary'} className="mt-0.5 h-5 px-1.5 text-[10px] capitalize">
                    {task.state}
                  </Badge>
                </div>
                <div className="rounded-lg border bg-muted/30 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Volume</p>
                  <p className="truncate font-mono text-xs" title={task.volume_id}>{task.volume_id}</p>
                </div>
              </div>
            </div>

            {/* Rejection Counts */}
            {(task.annotation_rejection_count > 0 || task.review_rejection_count > 0) && (
              <div className="mt-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3 text-destructive" />
                  <p className="text-[10px] font-medium uppercase tracking-wide text-destructive">Rejections</p>
                </div>
                <div className="flex gap-4 text-xs">
                  {task.annotation_rejection_count > 0 && (
                    <span className="text-destructive">
                      Annotation: <strong>{task.annotation_rejection_count}</strong>
                    </span>
                  )}
                  {task.review_rejection_count > 0 && (
                    <span className="text-destructive">
                      Review: <strong>{task.review_rejection_count}</strong>
                    </span>
                  )}
                </div>
              </div>
            )}
          </section>

          <div className="border-t" />

          {/* Appearance Section - Combined Language & Theme */}
          <section className="px-5 py-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Settings2 className="h-3.5 w-3.5" />
              Appearance
            </h3>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">Language</p>
                <LanguageToggle />
              </div>
              <div className="flex-1">
                <p className="mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">Theme</p>
                <ThemeToggle />
              </div>
            </div>
          </section>

          <div className="border-t" />

          {/* Typography Section */}
          <section className="px-5 py-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Type className="h-3.5 w-3.5" />
              Typography
            </h3>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">Font</p>
                <Select
                  value={editorFontFamily}
                  onValueChange={(value) => setEditorFontFamily(value as typeof editorFontFamily)}
                >
                  <SelectTrigger className="h-8 cursor-pointer text-xs">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map((font) => (
                      <SelectItem key={font.value} value={font.value} className="cursor-pointer text-xs">
                        <span>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-20">
                <p className="mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">Size</p>
                <Select
                  value={String(editorFontSize)}
                  onValueChange={(value) => setEditorFontSize(Number(value) as typeof editorFontSize)}
                >
                  <SelectTrigger className="h-8 cursor-pointer text-xs">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_SIZES.map((size) => (
                      <SelectItem key={size} value={String(size)} className="cursor-pointer text-xs">
                        {size}px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <div className="border-t" />

          {/* Actions Section */}
          <section className="px-5 py-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              Actions
            </h3>

            {/* Role-based Actions */}
            {showAnnotatorActions && (
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleAction(onSubmit)}
                  disabled={isSubmitting}
                  className="h-8 flex-1 cursor-pointer gap-1.5 text-xs"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  {isSubmitting ? t('actions.submitting') : t('actions.submit')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(onTrash)}
                  disabled={isSubmitting}
                  className="h-8 flex-1 cursor-pointer gap-1.5 border-destructive/50 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('actions.trash')}
                </Button>
              </div>
            )}

            {showReviewerActions && (
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleAction(onApprove)}
                  disabled={isSubmitting}
                  className="h-8 flex-1 cursor-pointer gap-1.5 bg-green-600 text-xs hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  {isSubmitting ? t('actions.approving') : t('actions.approve')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(onReject)}
                  disabled={isSubmitting}
                  className="h-8 flex-1 cursor-pointer gap-1.5 border-destructive/50 text-xs text-destructive hover:bg-destructive/10"
                >
                  <X className="h-3.5 w-3.5" />
                  {t('actions.reject')}
                </Button>
              </div>
            )}

            {showFinalReviewerActions && (
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleAction(onApprove)}
                  disabled={isSubmitting}
                  className="h-8 flex-1 cursor-pointer gap-1.5 bg-green-600 text-xs hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  {isSubmitting ? t('actions.approving') : t('actions.approve')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(onReject)}
                  disabled={isSubmitting}
                  className="h-8 flex-1 cursor-pointer gap-1.5 border-destructive/50 text-xs text-destructive hover:bg-destructive/10"
                >
                  <X className="h-3.5 w-3.5" />
                  {t('actions.reject')}
                </Button>
              </div>
            )}

            {/* Show status when no actions available */}
            {!showAnnotatorActions && !showReviewerActions && !showFinalReviewerActions && (
              <div className="rounded-lg border bg-muted/30 py-3 text-center">
                <p className="text-xs text-muted-foreground">
                  {task.state === 'completed'
                    ? 'Task completed'
                    : task.state === 'trashed'
                      ? 'Task trashed'
                      : `Viewing as ${userRole ? ROLE_CONFIG[userRole]?.label : 'Unknown'}`}
                </p>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
