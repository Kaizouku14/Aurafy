"use client";

import React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type QuizSessionFooterProps = {
  isPending: boolean;
  isLast: boolean;
  disabled: boolean;
  onNext: () => void;
  onEnterPress: (e: React.KeyboardEvent) => void;
};

export const QuizSessionFooter = ({
  isPending,
  isLast,
  disabled,
  onNext,
  onEnterPress,
}: QuizSessionFooterProps) => {
  return (
    <div className="mt-auto flex justify-end">
      <Button
        onClick={onNext}
        disabled={disabled}
        onKeyDown={onEnterPress}
        className="bg-foreground text-background hover:bg-main hover:text-main-foreground w-40 border-4 border-transparent font-black tracking-widest uppercase"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : isLast ? (
          "Submit Quiz"
        ) : (
          <>
            Next <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </div>
  );
};
