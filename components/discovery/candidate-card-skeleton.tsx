import { Skeleton } from '@/components/ui/skeleton'

export function CandidateCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton width={48} height={48} rounded="full" className="shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton height={14} className="w-3/5" />
          <Skeleton height={12} className="w-2/5" />
          <Skeleton height={10} className="w-1/3" />
        </div>
      </div>
      <Skeleton height={12} className="w-full" />
      <Skeleton height={12} className="w-4/5" />
      <div className="flex gap-2">
        <Skeleton width={64} height={22} rounded="md" />
        <Skeleton width={72} height={22} rounded="md" />
        <Skeleton width={56} height={22} rounded="md" />
      </div>
      <div className="flex gap-3 pt-1">
        <Skeleton width={48} height={14} rounded="md" />
        <Skeleton width={60} height={14} rounded="md" />
      </div>
    </div>
  )
}

export function CandidateCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <CandidateCardSkeleton key={i} />
      ))}
    </div>
  )
}
