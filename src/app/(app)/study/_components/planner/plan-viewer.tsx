"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export const PlanViewer = ({ planId, onBack }: { planId: string; onBack: () => void }) => {
  const { data: plan, isLoading } = api.planner.getPlan.useQuery({ planId });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <Loader2 className="animate-spin size-10 text-muted-foreground mb-4" />
        <h2 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Loading Plan...</h2>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="flex flex-col size-full max-w-5xl mx-auto p-3 sm:p-4 md:p-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-8 border-b-4 border-border pb-4">
        <Button
          onClick={onBack}
          variant="noShadow"
          className="border-2 border-border gap-1.5 font-bold px-3 py-1.5 bg-secondary-background hover:bg-background transition-colors text-foreground shrink-0 w-fit"
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight truncate">{plan.title}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-bold">{plan.startDate} → {plan.endDate} · {plan.hoursPerDay}h/day</p>
        </div>
      </div>

      <div className="space-y-6 pb-20 overflow-y-auto">
        {plan.plan.map((day, dayIndex) => (
          <div key={dayIndex} className="border-4 border-border rounded-base bg-secondary-background overflow-hidden shadow-shadow">
            <div className="bg-foreground text-background px-5 py-3 flex items-center justify-between">
              <h3 className="font-black uppercase tracking-wider text-sm">{day.date}</h3>
              <span className="text-xs font-bold opacity-70">{day.blocks.length} blocks</span>
            </div>
            <div className="divide-y-2 divide-border">
              {day.blocks.map((block, blockIndex) => (
                <div key={blockIndex} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 px-4 sm:px-5 py-3 hover:bg-background/50 transition-colors">
                  <div className="flex items-center gap-2 sm:w-20 shrink-0">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span className="text-sm font-black text-muted-foreground">{block.time}</span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-1">
                    <span className="font-black text-foreground text-sm sm:text-base">{block.subject}</span>
                    <span className="text-muted-foreground font-base mx-1">·</span>
                    <span className="text-muted-foreground font-bold text-xs sm:text-sm">{block.activity}</span>
                  </div>
                  <div className="shrink-0 bg-main/20 text-foreground text-xs font-bold px-2.5 py-1 rounded-base border border-border">
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
