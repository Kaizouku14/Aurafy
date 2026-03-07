import Conversation from "./_components/chat/conversation";
import MusicList from "./_components/music/music-list";

const Page = () => {
  return (
    <div className="flex h-[calc(100vh-4.5rem)] pt-4 pb-4">
      <div className="flex h-full w-full flex-col md:flex-row gap-4">
        <div className="flex-1 min-w-0 min-h-0 md:flex-[1.2]">
          <Conversation />
        </div>
        <div className="flex-1 min-w-0 min-h-0 md:flex-[0.85]">
          <MusicList />
        </div>
      </div>
    </div>
  );
};

export default Page;
