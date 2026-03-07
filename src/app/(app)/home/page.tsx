import Conversation from "./_components/chat/conversation";
import MusicList from "./_components/music/music-list";

const Page = () => {
  return (
    <div className="flex h-[calc(100vh-4.5rem)] pt-4 pb-16 md:pb-4">
      <div className="flex h-full w-full flex-col md:flex-row gap-4 overflow-y-auto md:overflow-hidden pr-1 md:pr-0">
        <div className="min-h-[400px] min-w-0 flex-none md:h-full md:flex-[1.2] pb-2 md:pb-0">
          <Conversation />
        </div>
        <div className="min-h-[350px] min-w-0 flex-none md:h-full md:flex-[0.85]">
          <MusicList />
        </div>
      </div>
    </div>
  );
};

export default Page;
