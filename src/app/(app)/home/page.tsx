import Conversation from "./_components/chat/conversation";
import MusicList from "./_components/music/music-list";

const Page = () => {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-start justify-center gap-4 pt-4">
      <Conversation />
      <MusicList />
    </div>
  );
};

export default Page;
