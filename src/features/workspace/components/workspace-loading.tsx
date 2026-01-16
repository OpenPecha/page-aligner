import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton row mimicking the editor layout with image on left and text on right.
 */
function SkeletonRow({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="flex min-h-[200px] border-b border-border"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image Column Skeleton */}
      <div className="relative flex w-[45%] flex-shrink-0 items-center justify-center bg-muted/20 p-6">
        <Skeleton className="aspect-[4/3] w-full max-w-md rounded-lg" />
        {/* Page number badge skeleton */}
        <Skeleton className="absolute right-4 top-4 h-6 w-8 rounded" />
      </div>

      {/* Text Column Skeleton */}
      <div className="flex flex-1 flex-col gap-3 bg-background p-6 pt-10">
        {/* Text lines with varying widths for natural look */}
        <Skeleton className="h-5 w-[95%]" />
        <Skeleton className="h-5 w-[88%]" />
        <Skeleton className="h-5 w-[92%]" />
        <Skeleton className="h-5 w-[75%]" />
        <Skeleton className="h-5 w-[85%]" />
        <Skeleton className="h-5 w-[60%]" />
      </div>
    </div>
  )
}

/**
 * Workspace loading skeleton that mimics the actual workspace layout.
 * Shows a header skeleton and multiple editor row skeletons for visual continuity.
 */
export function WorkspaceLoading() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header Skeleton */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
        {/* Logo & App Name skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Menu button skeleton */}
        <Skeleton className="h-10 w-10 rounded-lg" />
      </header>

      {/* Editor Area Skeleton */}
      <div className="flex-1 overflow-hidden">
        {/* Staggered animation for each row */}
        <SkeletonRow delay={0} />
        <SkeletonRow delay={100} />
        <SkeletonRow delay={200} />
        <SkeletonRow delay={300} />
      </div>

      {/* Subtle loading indicator at bottom */}
      <div className="flex h-12 flex-shrink-0 items-center justify-center border-t border-border/40 bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" />
          </div>
        </div>
      </div>
    </div>
  )
}
