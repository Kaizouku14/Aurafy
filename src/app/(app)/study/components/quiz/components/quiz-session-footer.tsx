"use client";

import React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type QuizSessionFooterProps = {
  isPending: boolean;
  isLast: boolean;
  disabled: boolean;
  onNext: () => void;
};

export const QuizSessionFooter = ({
  isPending,
  isLast,
  disabled,
  onNext,
}: QuizSessionFooterProps) => {
  return (
    <div className="mt-auto flex justify-end">
      <Button
        onClick={onNext}
        disabled={disabled}
        className="bg-foreground text-background hover:bg-main hover:text-main-foreground border-4 border-transparent font-black uppercase tracking-widest"
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
