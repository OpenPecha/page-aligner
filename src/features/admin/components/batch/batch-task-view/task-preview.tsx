import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'
import { ImageCanvas } from '@/features/workspace/components/image-canvas'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { BatchTask } from '@/types'

interface TaskPreviewProps {
  task: BatchTask | null
  onRestore: () => void
  isRestoring: boolean
  isLoading: boolean
}

export function TaskPreview({
  task,
  onRestore,
  isRestoring,
  isLoading,
}: TaskPreviewProps) {
  const { t } = useTranslation('admin')

  if (isLoading) {
    return <TaskPreviewSkeleton />
  }

  if (!task) {
    return (
      <div className="flex flex-col h-full bg-muted/20">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">{t('batches.noTaskSelected')}</p>
            <p className="text-sm mt-1">{t('batches.selectTaskToPreview')}</p>
          </div>
        </div>
      </div>
    )
  }

  const canRestore = task.state === 'trashed'

  // Derive layout direction from orientation
  // Portrait images → horizontal layout (side-by-side)
  // Landscape images → vertical layout (stacked)
  const isHorizontalLayout = task.orientation === 'portrait'

  return (
    <div className="flex flex-col h-full">
      {/* Content Area - Dynamic Layout */}
      <div
        className={cn(
          'flex-1 min-h-0 flex overflow-hidden',
          isHorizontalLayout ? 'flex-row' : 'flex-col'
        )}
      >
        {/* Image Section */}
        <div
          className={cn(
            'overflow-hidden',
            isHorizontalLayout
              ? 'w-1/2 h-full border-r border-border'
              : 'flex-1 min-h-0 border-b border-border'
          )}
        >
          <ImageCanvas imageUrl={task.task_url} />
        </div>

        {/* Transcript Section */}
        <div
          className={cn(
            'bg-sky-50 dark:bg-sky-900/20 overflow-hidden',
            isHorizontalLayout
              ? 'w-1/2 h-full flex flex-col'
              : 'flex-shrink-0'
          )}
        >
          <div className={cn('p-4', isHorizontalLayout && 'flex-1 flex flex-col')}>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              {t('batches.transcript')}
            </h4>
            <div
              className={cn(
                'p-3 rounded-md bg-background border border-border overflow-y-auto',
                isHorizontalLayout
                  ? 'flex-1 min-h-0'
                  : 'min-h-[80px] max-h-[120px]'
              )}
            >
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  fontFamily: 'Monlam',
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                }}
              >
                {task.task_transcript || (
                  <span className="text-muted-foreground italic">
                    {t('batches.noTranscript')}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Restore Button */}
      <div className="border-t border-border bg-card px-4 py-3 flex justify-center flex-shrink-0">
        <Button
          variant="outline"
          onClick={onRestore}
          disabled={!canRestore || isRestoring}
          className={cn(
            'min-w-[140px]',
            canRestore && 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
          )}
        >
          <RotateCcw className={cn('h-4 w-4 mr-2', isRestoring && 'animate-spin')} />
          {isRestoring ? t('batches.restoring') : t('batches.restore')}
        </Button>
      </div>
    </div>
  )
}

function TaskPreviewSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="border-t border-border bg-sky-50 dark:bg-sky-900/20 p-4">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="border-t border-border bg-card px-4 py-3 flex justify-center">
        <Skeleton className="h-10 w-[140px]" />
      </div>
    </div>
  )
}

