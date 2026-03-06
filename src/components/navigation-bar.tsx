import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Brain, MessageCircle } from "lucide-react";
import { PAGE_ROUTES } from "@/constants/page-routes";

const MENUS = [
  {
    label: "Chat",
    description: "Talk to Aurafy AI and get playlists",
    icon: MessageCircle,
    href: PAGE_ROUTES.HOME,
  },
  {
    label: "Study",
    description: "Focus tools, flashcards, and planners",
    icon: Brain,
    href: PAGE_ROUTES.STUDY,
  },
];

const NavigationBar = () => {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
      {MENUS.map((menu) => {
        const Icon = menu.icon;
        const isActive = pathname === menu.href;

        return (
          <Tooltip key={menu.href}>
            <TooltipTrigger asChild>
              <Button
                variant={isActive ? "default" : "neutral"}
                className="flex items-center gap-2"
                onClick={() => (window.location.href = menu.href)}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span className="hidden sm:inline">{menu.label}</span>
              </Button>
            </TooltipTrigger>
            {menu.description && (
              <TooltipContent side="bottom" className="max-w-xs">
                {menu.description}
              </TooltipContent>
            )}
          </Tooltip>
        );
      })}
    </div>
  );
};

export default NavigationBar;
