import { Music } from "lucide-react";

const MusicEmpty = () => {
  return (
    <div className="flex h-60 flex-col items-center justify-center gap-3 py-8">
      <div className="bg-main shadow-shadow rounded-base border-border flex size-12 items-center justify-center border-2">
        <Music className="text-border size-6" />
      </div>
      <div className="text-center">
        <h2 className="font-heading text-main text-lg">No tracks yet</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Tell Aurafy how you feel and music will appear here.
        </p>
      </div>
    </div>
  );
};

export default MusicEmpty;
