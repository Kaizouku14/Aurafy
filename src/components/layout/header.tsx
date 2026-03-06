"use client";

import { AudioLines } from "lucide-react";
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
    <div className="flex items-center justify-between p-4">
      <div className="bg-main shadow-shadow rounded-base border-border flex size-12 items-center justify-center border-2">
        <AudioLines className="text-border size-6" />
      </div>

      <NavigationBar />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user?.image ?? "https://github.com/shadcn.png"}
              alt={user?.name ?? "@shadcn"}
            />
            <AvatarFallback>
              {user?.name?.charAt(0)?.toUpperCase() ?? "A"}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium">
              {user?.name ?? "Anonymous"}
            </span>
            <span className="text-muted-foreground text-xs">Signed in</span>
          </div>
        </div>

        <Button variant="neutral" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Header;
