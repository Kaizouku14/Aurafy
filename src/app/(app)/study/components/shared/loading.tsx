import { Loader2 } from "lucide-react";

export const Loading = ({ text }: { text: string }) => {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xs items-center justify-center p-3 sm:min-h-[70vh] sm:max-w-md sm:p-4 md:min-h-[80vh] md:max-w-4xl md:p-8">
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="text-muted-foreground mb-4 size-6 animate-spin sm:size-8 md:size-10" />
        <h2 className="text-muted-foreground text-base font-black tracking-widest uppercase sm:text-lg md:text-xl">
          Loading {text}...
        </h2>
      </div>
    </div>
  );
};
