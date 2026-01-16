import { useTranslation } from 'react-i18next'
import { ArrowRight, BookOpen, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { STATE_CONFIG } from '../constants'
import type { AssignedTask } from '@/types'

interface TaskCardProps {
  task: AssignedTask
  onContinue: () => void
}

export function TaskCard({ task, onContinue }: TaskCardProps) {
  const { t } = useTranslation('dashboard')
  const stateConfig = task.state ? STATE_CONFIG[task.state] : null

  // Get first image and text for preview
  const previewImage = task.images[0]
  const previewText = task.texts[0]

  return (
    <Card className="max-w-2xl overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg">
      {/* Task Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {previewImage ? (
          <img
            src={previewImage.url}
            alt={`Volume ${task.volume_id}`}
            className="h-full w-full object-contain bg-black/5"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          {stateConfig && (
            <Badge variant={stateConfig.variant}>
              {stateConfig.label}
            </Badge>
          )}
        </div>
        {/* Image count badge */}
        {task.images.length > 1 && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              {task.images.length} pages
            </Badge>
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate" title={task.volume_id}>
              {task.volume_id}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {task.texts.length} text{task.texts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{t('taskCard.transcript')}</p>
          <p className="text-sm bg-muted/50 p-3 rounded-md font-mono leading-relaxed line-clamp-3">
            {previewText?.content || <span className="text-muted-foreground italic">No content yet</span>}
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={onContinue}
          className="w-full sm:w-auto"
          size="lg"
        >
          {t('taskCard.continue')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

