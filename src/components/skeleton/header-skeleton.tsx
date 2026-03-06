import { Skeleton } from "@/components/ui/skeleton";

export const HeaderSkeleton = () => {
  return (
    <header className="flex items-center justify-between py-3">
      <Skeleton className="h-7 w-24 rounded-none" />

      <div className="flex items-center gap-1">
        <Skeleton className="h-8 w-16 rounded-none" />
        <Skeleton className="h-8 w-16 rounded-none" />
      </div>

      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-none" />
      </div>
    </header>
  );
};
