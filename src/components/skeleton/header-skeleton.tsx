import { Skeleton } from "@/components/ui/skeleton";

export const HeaderSkeleton = () => {
  return (
    <div className="flex items-center justify-between py-4">
      <Skeleton className="h-12 w-12 rounded-lg" />

      <div className="flex items-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-md" />
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />

          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-3 w-12 rounded-md" />
          </div>
        </div>

        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </div>
  );
};
