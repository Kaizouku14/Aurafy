import { HeaderSkeleton } from "@/components/skeleton/header-skeleton";

const Loading = () => {
  return (
    <main className="animate-in fade-in mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 duration-300">
      <HeaderSkeleton />
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground flex flex-col items-center gap-4">
          <div className="border-main size-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-sm font-bold tracking-widest uppercase">
            Loading Aurafy...
          </p>
        </div>
      </div>
    </main>
  );
};

export default Loading;
