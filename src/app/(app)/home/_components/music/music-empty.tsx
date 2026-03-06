import { Music } from "lucide-react";

const MusicEmpty = () => {
  return (
    <div className="flex h-48 flex-col items-start justify-center px-4">
      <Music className="text-muted-foreground/40 mb-3 size-8" />
      <p className="text-foreground text-sm font-bold">No tracks yet</p>
      <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
        Tell Aurafy how you feel — music will appear here.
      </p>
    </div>
  );
};

export default MusicEmpty;
