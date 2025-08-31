import { Skeleton } from "@/components/ui/skeleton"

export function FooterSkeleton() {
  return (
    <footer className="bg-muted/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-28" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-18" />
              <Skeleton className="h-4 w-22" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-20" />
            <div className="flex space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-8">
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    </footer>
  )
}