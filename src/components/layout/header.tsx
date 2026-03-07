"use client";

import { AudioLines, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { PAGE_ROUTES } from "@/constants/page-routes";
import { sileo } from "sileo";
import { authClient } from "@/server/better-auth/client";
import { useRouter } from "next/navigation";
import NavigationBar from "../navigation-bar";
import { HeaderSkeleton } from "../skeleton/header-skeleton";

const Header = () => {
  const router = useRouter();
  const { data } = authClient.useSession();

  if (!data) {
    return <HeaderSkeleton />;
  }

  const { user } = data;

  const handleLogout = async () => {
    sileo.promise(authClient.signOut(), {
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
        <span className="text-main-foreground text-sm font-black tracking-tighter uppercase hidden sm:inline">
          Aurafy
        </span>
      </div>

      <NavigationBar />

      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={user?.image ?? "https://github.com/shadcn.png"}
            alt={user?.name ?? "User"}
          />
          <AvatarFallback className="text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() ?? "A"}
          </AvatarFallback>
        </Avatar>

        <Button variant="neutral" size="sm" onClick={handleLogout} className="gap-1.5">
          <LogOut className="size-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
