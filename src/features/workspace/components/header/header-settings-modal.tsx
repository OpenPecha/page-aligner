import {
  User,
  FileText,
  Languages,
  Palette,
  Type,
  Zap,
  LogOut,
  Loader2,
  Trash2,
  Send,
  Check,
  X,
  BookOpen,
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
import { Separator } from '@/components/ui/separator'
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
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <DialogHeader className="px-6 pb-4 pt-6">
          <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pb-10">
          {/* Profile Section */}
          <section className="px-6 py-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Profile
              </h3>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-lg font-semibold text-primary-foreground shadow-md">
                  {currentUser?.username?.charAt(0).toUpperCase() ||
                    currentUser?.email?.charAt(0).toUpperCase() ||
                    'U'}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {currentUser?.username || currentUser?.email?.split('@')[0] || 'User'}
                  </p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {currentUser?.role ? ROLE_CONFIG[currentUser.role]?.label : 'No Role'}
                  </Badge>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </section>

          <Separator />

          {/* Task Detail Section */}
          <section className="px-6 py-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                <FileText className="h-4 w-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Task Detail
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="mb-1 text-xs text-muted-foreground">Task ID</p>
                <p className="truncate font-mono text-sm font-medium" title={task.task_id}>
                  {task.task_id.slice(0, 12)}...
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="mb-1 text-xs text-muted-foreground">Status</p>
                <Badge variant={STATUS_VARIANTS[task.state] || 'secondary'} className="capitalize">
                  {task.state}
                </Badge>
              </div>
              <div className="col-span-2 rounded-xl bg-muted/50 p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Volume ID</p>
                </div>
                <p className="mt-1 font-mono text-sm font-medium">{task.volume_id}</p>
              </div>
            </div>

            {/* Rejection Counts - only show if there are rejections */}
            {(task.annotation_rejection_count > 0 || task.review_rejection_count > 0) && (
              <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-xs font-medium text-destructive">Rejection History</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {task.annotation_rejection_count > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Annotation</p>
                      <p className="font-mono text-sm font-medium text-destructive">
                        {task.annotation_rejection_count} rejection{task.annotation_rejection_count > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                  {task.review_rejection_count > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Review</p>
                      <p className="font-mono text-sm font-medium text-destructive">
                        {task.review_rejection_count} rejection{task.review_rejection_count > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          <Separator />

          {/* Localization Section */}
          <section className="px-6 py-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <Languages className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Language
              </h3>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <LanguageToggle className="justify-center" />
            </div>
          </section>

          <Separator />

          {/* Theme Section */}
          <section className="px-6 py-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                <Palette className="h-4 w-4 text-violet-600" />
              </div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Theme
              </h3>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <ThemeToggle className="justify-center" />
            </div>
          </section>

          <Separator />

          {/* Font Selection Section */}
          <section className="px-6 py-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
                <Type className="h-4 w-4 text-rose-600" />
              </div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Font Settings
              </h3>
            </div>

            <div className="space-y-3">
              {/* Font Family */}
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="mb-2 text-xs text-muted-foreground">Font Family</p>
                <Select
                  value={editorFontFamily}
                  onValueChange={(value) => setEditorFontFamily(value as typeof editorFontFamily)}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="mb-2 text-xs text-muted-foreground">Font Size</p>
                <Select
                  value={String(editorFontSize)}
                  onValueChange={(value) => setEditorFontSize(Number(value) as typeof editorFontSize)}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_SIZES.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <Separator />

          {/* Actions Section */}
          <section className="px-6 py-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Actions
              </h3>
            </div>

            <div className="space-y-3">

              {/* Role-based Actions */}
              {showAnnotatorActions && (
                <div className="flex gap-2">
                   <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleAction(onSubmit)}
                    disabled={isSubmitting}
                    className="flex-1 gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isSubmitting ? t('actions.submitting') : t('actions.submit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(onTrash)}
                    disabled={isSubmitting}
                    className="flex-1 gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
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
                    className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {isSubmitting ? t('actions.approving') : t('actions.approve')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(onReject)}
                    disabled={isSubmitting}
                    className="flex-1 gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
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
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {isSubmitting ? t('actions.approving') : t('actions.approve')}
                </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(onReject)}
                    disabled={isSubmitting}
                    className="flex-1 gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                    {t('actions.reject')}
                  </Button>
                </div>
              )}

              {/* Show status when no actions available */}
              {!showAnnotatorActions && !showReviewerActions && !showFinalReviewerActions && (
                <div className="rounded-xl bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {task.state === 'completed'
                      ? 'Task completed'
                      : task.state === 'trashed'
                        ? 'Task trashed'
                        : `Viewing as ${userRole ? ROLE_CONFIG[userRole]?.label : 'Unknown'}`}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
