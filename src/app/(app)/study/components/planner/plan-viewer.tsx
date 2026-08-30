"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import { Loading } from "../shared/loading";

export const PlanViewer = ({
  planId,
  onBack,
}: {
  planId: string;
  onBack: () => void;
}) => {
  const { data: plan, isLoading } = api.planner.getPlan.useQuery({ planId });

  if (isLoading) {
    return <Loading text="Plan" />;
  }

  if (!plan) return null;

  return (
    <div className="animate-fade-enter mx-auto flex size-full max-w-5xl flex-col p-3 sm:p-4 md:p-8">
      <div className="border-border mb-4 flex flex-col gap-3 border-b-4 pb-4 sm:mb-8 sm:flex-row sm:items-center sm:gap-4">
        <Button
          onClick={onBack}
          variant="noShadow"
          className="border-border bg-secondary-background hover:bg-background text-foreground w-fit shrink-0 gap-1.5 border-2 px-3 py-1.5 font-bold transition-colors"
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-black tracking-tight uppercase sm:text-2xl">
            {plan.title}
          </h2>
          <p className="text-muted-foreground text-xs font-bold sm:text-sm">
            {plan.startDate} → {plan.endDate} · {plan.hoursPerDay}h/day
          </p>
        </div>
      </div>

      <div className="space-y-6 overflow-y-auto pb-20">
        {plan.plan.map((day, dayIndex) => (
          <div
            key={dayIndex}
            className="border-border rounded-base bg-secondary-background shadow-shadow overflow-hidden border-4"
          >
            <div className="bg-foreground text-background flex items-center justify-between px-5 py-3">
              <h3 className="text-sm font-black tracking-wider uppercase">
                {day.date}
              </h3>
              <span className="text-xs font-bold opacity-70">
                {day.blocks.length} blocks
              </span>
            </div>
            <div className="divide-border divide-y-2">
              {day.blocks.map((block, blockIndex) => (
                <div
                  key={blockIndex}
                  className="hover:bg-background/50 flex flex-col gap-1.5 px-4 py-3 transition-colors sm:flex-row sm:items-center sm:gap-4 sm:px-5"
                >
                  <div className="flex shrink-0 items-center gap-2 sm:w-20">
                    <Clock className="text-muted-foreground size-3.5" />
                    <span className="text-muted-foreground text-sm font-black">
                      {block.time}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1">
                    <span className="text-foreground text-sm font-black sm:text-base">
                      {block.subject}
                    </span>
                    <span className="text-muted-foreground font-base mx-1">
                      ·
                    </span>
                    <span className="text-muted-foreground text-xs font-bold sm:text-sm">
                      {block.activity}
                    </span>
                  </div>
                  <div className="bg-main/20 text-foreground rounded-base border-border shrink-0 border px-2.5 py-1 text-xs font-bold">
                    {block.duration}m
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
