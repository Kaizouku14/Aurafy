import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music } from "lucide-react";
import MusicPlayer from "./music-player";
import MusicEmpty from "./music-empty";

const MusicList = () => {
  return (
    <Card className="flex w-full max-w-md flex-col pt-1">
      <CardHeader className="border-border border-b-2 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-main shadow-shadow rounded-base flex size-9 items-center justify-center border-2 border-black">
            <Music className="size-5 text-black" />
          </div>
          <div>
            <CardTitle className="text-foreground text-base">
              Your Music
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Powered by Spotify
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-1">
        <ScrollArea className="h-61">
          <MusicEmpty />
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-border border-t-2 px-4 pt-4">
        <MusicPlayer />
      </CardFooter>
    </Card>
  );
};

export default MusicList;
