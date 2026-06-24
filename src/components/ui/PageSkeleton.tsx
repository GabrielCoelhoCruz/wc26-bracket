interface PageSkeletonProps {
  lines?: number
  className?: string
}

export default function PageSkeleton({
  lines = 5,
  className = "",
}: PageSkeletonProps) {
  return (
    <div
      className={`mx-auto w-full max-w-4xl animate-pulse px-4 py-12 sm:py-16 ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className="mx-auto mb-6 h-3 w-28 rounded bg-muted" />
      <div className="mx-auto mb-4 h-10 w-56 max-w-full rounded-lg bg-muted" />
      <div className="mx-auto mb-10 h-4 w-80 max-w-full rounded bg-muted/80" />
      <div className="space-y-3">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className="h-14 rounded-xl border border-border/50 bg-muted/60 sm:h-16"
          />
        ))}
      </div>
    </div>
  )
}
