"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ListSectionProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  isLoading: boolean;
  loadingLabel: string;
  isEmpty: boolean;
  emptyState: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ListSection = ({
  title,
  description,
  action,
  isLoading,
  loadingLabel,
  isEmpty,
  emptyState,
  children,
  className,
}: ListSectionProps) => {
  return (
    <div
      className={cn(
        "animate-in fade-in mx-auto flex size-full max-w-5xl flex-col space-y-8 p-4 duration-300 md:p-8",
        className,
      )}
    >
      <div className="border-border flex flex-col items-start justify-between gap-4 border-b-4 pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">{title}</h2>
          <p className="text-muted-foreground font-base mt-2">{description}</p>
        </div>
        {action}
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground animate-pulse text-lg font-bold tracking-widest uppercase">
            {loadingLabel}
          </p>
        </div>
      ) : isEmpty ? (
        emptyState
      ) : (
        children
      )}
    </div>
  );
};
