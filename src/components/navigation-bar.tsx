"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Brain, MessageCircle } from "lucide-react";
import { PAGE_ROUTES } from "@/constants/page-routes";
import Link from "next/link";

const MENUS = [
  {
    label: "Chat",
    icon: MessageCircle,
    href: PAGE_ROUTES.HOME,
  },
  {
    label: "Study",
    icon: Brain,
    href: PAGE_ROUTES.STUDY,
  },
];

const NavigationBar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {MENUS.map((menu) => {
        const Icon = menu.icon;
        const isActive = pathname === menu.href;

        return (
          <Link
            key={menu.href}
            href={menu.href}
            className={cn(
              "flex items-center gap-2 border-2 px-3 py-1.5 text-sm font-semibold transition-all",
              isActive
                ? "bg-main text-main-foreground border-border shadow-shadow"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            <span>{menu.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default NavigationBar;
