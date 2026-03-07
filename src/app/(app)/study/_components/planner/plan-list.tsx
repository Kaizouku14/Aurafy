"use client";

import { api } from "@/trpc/react";
import { PlanCreator } from "./plan-creator";
import { Button } from "@/components/ui/button";
import { CalendarCheck2, Trash2, Eye, Calendar } from "lucide-react";
import { StaggerList } from "@/components/animation/stagger-list";

export const PlanList = ({ onSelectPlan }: { onSelectPlan: (planId: string) => void }) => {
  const { data: plans, isLoading } = api.planner.getPlans.useQuery();
  const utils = api.useUtils();

  const deletePlan = api.planner.deletePlan.useMutation({
    onSuccess: () => {
      void utils.planner.getPlans.invalidate();
    },
  });

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-border pb-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Study Plans</h2>
          <p className="text-muted-foreground font-base mt-2">AI-generated schedules to maximize your study time.</p>
        </div>
        <PlanCreator />
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <p className="animate-pulse font-bold text-lg uppercase tracking-widest text-muted-foreground">Loading plans...</p>
        </div>
      ) : !plans || plans.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-border rounded-base bg-secondary-background/50 p-12 text-center">
          <CalendarCheck2 className="size-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold uppercase mb-2">No Plans Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md font-base">
            Tell the AI your subjects, exam dates, and available hours. It will create a day-by-day study schedule for you.
          </p>
          <PlanCreator className="bg-main text-main-foreground hover:bg-main/90" />
        </div>
      ) : (
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20" itemDistance={20} staggerDelay={0.08}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="group relative flex flex-col border-4 border-border rounded-base bg-secondary-background p-5 shadow-shadow transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <Button
                variant="noShadow"
                size="icon"
                onClick={() => deletePlan.mutate({ planId: plan.id })}
                disabled={deletePlan.isPending}
                className="absolute top-3 right-3 rounded-base border-2 border-transparent text-main-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10 transition-all md:opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="size-4" />
              </Button>

              <div className="flex-1 space-y-3 mb-6">
                <h3 className="font-black text-xl leading-tight line-clamp-2 pr-8">{plan.title}</h3>
                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>{plan.startDate} → {plan.endDate}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {plan.subjects.map((s, i) => (
                    <span key={i} className="text-xs font-bold bg-main/20 text-foreground px-2 py-0.5 rounded-base border border-border">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => onSelectPlan(plan.id)}
                className="w-full bg-foreground text-background border-2 border-transparent gap-2 font-bold hover:bg-main hover:text-main-foreground hover:border-border transition-colors"
              >
                <Eye className="size-4" /> View Schedule
              </Button>
            </div>
          ))}
        </StaggerList>
      )}
    </div>
  );
};
