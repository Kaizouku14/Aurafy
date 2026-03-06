import Conversation from "./_components/chat/conversation";
import MusicList from "./_components/music/music-list";

const Page = () => {
  return (
    <div className="flex h-[calc(100vh-4.5rem)] items-start pt-4">
      <div className="flex h-full w-full gap-4">
        <div className="flex-[1.2] min-w-0">
          <Conversation />
        </div>
        <div className="flex-[0.85] min-w-0">
          <MusicList />
        </div>
      </div>
    </div>
  );
};

export default Page;

