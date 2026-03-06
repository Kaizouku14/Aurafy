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
    <main className="mx-auto flex min-h-screen w-full max-w-screen-xl flex-col px-4">
      <Header />
      {accessToken && <SpotifyPlayerProvider accessToken={accessToken} />}
      {children}
      <MiniPlayer />
    </main>
  );
};

export default Layout;
