import Header from "@/components/layout/header";
import { SpotifyPlayerProvider } from "@/lib/spotfiy/spotify-player-provider";
import { getSpotifyToken } from "@/server/better-auth";
import { getSession } from "@/server/better-auth/server";
import { redirect } from "next/navigation";
import { PAGE_ROUTES } from "@/constants/page-routes";
import { MiniPlayer } from "@/components/mini-player";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();

  if (!session) redirect(PAGE_ROUTES.LOGIN);

  const accessToken = await getSpotifyToken(session.user.id);

  return (
    <main className="mb-4 flex flex-col p-1.5">
      <Header />
      {accessToken && <SpotifyPlayerProvider accessToken={accessToken} />}
      <div className="pb-12">{children}</div>
      <MiniPlayer />
    </main>
  );
};

export default Layout;
