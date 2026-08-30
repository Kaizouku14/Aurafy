import { Loader2, MoveRight } from "lucide-react";
import type { ComponentType } from "react";

interface LoginButtonProps {
  provider: "spotify" | "google";
  label: string;
  icon: ComponentType<{ className?: string }>;
  isLoading: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  provider,
  label,
  icon: Icon,
  isLoading,
  isDisabled,
  onClick,
}) => {
  const variantClass =
    provider === "google"
      ? "bg-main text-main-foreground"
      : "bg-main text-main-foreground";

  const ctaLabel =
    provider === "google" ? `Continue with ${label}` : `Connect ${label}`;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled ?? isLoading}
      className={`${variantClass} border-border shadow-shadow group relative flex w-full items-center justify-center gap-3 border-[3px] py-4 text-base font-black transition-all hover:translate-x-px hover:translate-y-px active:translate-x-0.75 active:translate-y-0.75 active:shadow-none disabled:opacity-50`}
    >
      {isLoading ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <Icon className="size-6" />
      )}
      <span>{isLoading ? "Authenticating..." : ctaLabel}</span>
      <MoveRight className="absolute right-4 size-5 translate-x-[-4px] opacity-0 transition-[transform,opacity] group-hover:translate-x-0 group-hover:opacity-100" />
    </button>
  );
};
