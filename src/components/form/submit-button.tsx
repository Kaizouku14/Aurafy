import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import type React from "react";

interface LoadingButtonProps extends ButtonProps {
  className?: string;
  isLoading: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  className,
  isLoading,
  ...props
}) => {
  return (
    <Button className={cn("w-full", className)} disabled={isLoading} {...props}>
      {isLoading ? (
        <LoaderCircle
          className={cn(
            "text-primary-foreground h-6 w-6 animate-spin",
            props.variant === "neutral"
              ? "text-primary"
              : "text-primary-foreground",
          )}
        />
      ) : (
        <>{props.children}</>
      )}
    </Button>
  );
};

export default LoadingButton;
