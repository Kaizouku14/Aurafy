import Conversation from "./_components/chat/conversation";
import MusicList from "./_components/music/music-list";
import Link from "next/link";

const Page = () => {
  return (
    <div className="flex h-[calc(100vh-4rem)] justify-center pt-4">
      <div className="flex w-full max-w-4xl flex-col gap-4">
        <div className="flex items-start justify-center gap-4">
          <Conversation />
          <MusicList />
        </div>

        <p className="text-muted-foreground max-w-2xl self-center text-center text-xs">
          Full playback requires Spotify Premium. Free users may be limited to
          30-second previews.{" "}
          <Link
            href="https://www.spotify.com/premium"
            target="_blank"
            rel="noopener noreferrer"
            className="text-main underline"
          >
            Upgrade here
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Page;
