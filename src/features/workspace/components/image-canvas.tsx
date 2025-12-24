import { useRef } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface ImageCanvasProps {
  imageUrl: string
  isLoading?: boolean
}

export function ImageCanvas({ imageUrl, isLoading }: ImageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
          <span className="text-sm font-medium">Source Image</span>
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <Skeleton className="h-3/4 w-3/4" />
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex h-full flex-col">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit
        wheel={{ step: 0.1 }}
      >
        {({ zoomIn, zoomOut, resetTransform, centerView }) => (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
              <span className="text-sm font-medium text-foreground">Source Image</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => zoomIn()}
                  title="Zoom In (Ctrl++)"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => zoomOut()}
                  title="Zoom Out (Ctrl+-)"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => resetTransform()}
                  title="Reset Zoom (Ctrl+0)"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => centerView()}
                  title="Center Image"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Image Container */}
            <div className="flex-1 overflow-hidden bg-[#1a1a1a]">
              <TransformComponent
                wrapperStyle={{
                  width: '100%',
                  height: '100%',
                }}
                contentStyle={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={imageUrl}
                  alt="Source document"
                  className="max-h-full max-w-full object-contain"
                  draggable={false}
                />
              </TransformComponent>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}

