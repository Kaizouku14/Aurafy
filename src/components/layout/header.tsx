"use client";

import { AudioLines, Link2, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { PAGE_ROUTES } from "@/constants/page-routes";
import { sileo } from "sileo";
import { authClient } from "@/server/better-auth/client";
import { useRouter } from "next/navigation";
import NavigationBar from "../navigation-bar";
import { HeaderSkeleton } from "../skeleton/header-skeleton";
import { useEffect, useState } from "react";

const Header = () => {
  const router = useRouter();
  const { data } = authClient.useSession();
  const [hasSpotifyLinked, setHasSpotifyLinked] = useState(false);
  const user = data?.user;

  useEffect(() => {
    let mounted = true;

    const checkSpotifyLink = async () => {
      try {
        const result = await authClient.getAccessToken({
          providerId: "spotify",
        });

        if (mounted) {
          setHasSpotifyLinked(Boolean(result.data?.accessToken));
        }
      } catch {
        if (mounted) {
          setHasSpotifyLinked(false);
        }
      }
    };

    void checkSpotifyLink();

    return () => {
      mounted = false;
    };
  }, []);

  if (!data) {
    return <HeaderSkeleton />;
  }

  const handleSpotifyConnect = async () => {
    void sileo.promise(
      authClient.signIn.social({
        provider: "spotify",
        callbackURL: PAGE_ROUTES.HOME,
        errorCallbackURL: PAGE_ROUTES.HOME,
      }),
      {
        loading: {
          title: hasSpotifyLinked
            ? "Refreshing Spotify connection..."
            : "Redirecting to Spotify...",
        },
        success: () => ({
          title: hasSpotifyLinked
            ? "Spotify connection refreshed"
            : "Spotify connected",
        }),
        error: (err: unknown) => ({
          title: "Spotify connection failed",
          description: err instanceof Error ? err.message : String(err),
        }),
      },
    );
  };

  const handleLogout = async () => {
    void sileo.promise(authClient.signOut(), {
      loading: { title: "Signing you out..." },
      success: () => {
        router.push(PAGE_ROUTES.LOGIN);
        router.refresh();
        return {
          title: "Logged out successfully",
        };
      },
      error: (err: unknown) => ({
        title: "Logout failed",
        description: err instanceof Error ? err.message : String(err),
      }),
    });
  };

  return (
    <header className="flex items-center justify-between py-3">
      <div className="bg-main border-border shadow-shadow flex -rotate-1 items-center gap-2 border-2 px-2 py-1 sm:px-3 sm:py-1.5">
        <AudioLines className="text-main-foreground size-4" />
        <span className="text-main-foreground hidden text-sm font-black tracking-tighter uppercase sm:inline">
          Aurafy
        </span>
      </div>

      <NavigationBar />

      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant={hasSpotifyLinked ? "neutral" : "default"}
          size="sm"
          onClick={handleSpotifyConnect}
          className="gap-1.5"
        >
          <Link2 className="size-3.5" />
          <span className="hidden sm:inline">
            {hasSpotifyLinked ? "Reconnect Spotify" : "Connect Spotify"}
          </span>
        </Button>

        <Avatar className="h-8 w-8">
          <AvatarImage
            src={user?.image ?? "https://github.com/shadcn.png"}
            alt={user?.name ?? "User"}
          />
          <AvatarFallback className="text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() ?? "A"}
          </AvatarFallback>
        </Avatar>

        <Button
          variant="neutral"
          size="sm"
          onClick={handleLogout}
          className="gap-1.5"
        >
          <LogOut className="size-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
