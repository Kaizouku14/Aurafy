import { HeaderSkeleton } from "@/components/skeleton/header-skeleton";

const Loading = () => {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-screen-xl flex-col px-4 animate-in fade-in duration-300">
      <HeaderSkeleton />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="size-8 rounded-full border-4 border-main border-t-transparent animate-spin" />
          <p className="font-bold uppercase tracking-widest text-sm">Loading Aurafy...</p>
        </div>
      </div>
    </main>
  );
};

export default Loading;
