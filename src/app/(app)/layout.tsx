import Header from "@/components/layout/header";
import { SpotifyPlayerProvider } from "./home/_components/spotify-player-provider";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import { getSession } from "@/server/better-auth/server";
import { redirect } from "next/navigation";
import { PAGE_ROUTES } from "@/constants/page-routes";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();

  if (!session) redirect(PAGE_ROUTES.LOGIN);

  const result = await auth.api.getAccessToken({
    body: {
      providerId: "spotify",
      userId: session.user.id,
    },
    headers: await headers(),
  });

  const accessToken = result?.accessToken ?? null;
  return (
    <main className="flex flex-col gap-4 p-4">
      {/*<Header />*/}
      {accessToken && <SpotifyPlayerProvider accessToken={accessToken} />}

      <div>{children}</div>
    </main>
  );
};

export default Layout;
