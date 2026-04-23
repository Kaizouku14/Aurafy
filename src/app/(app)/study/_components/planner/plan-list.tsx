"use client";

import { api } from "@/trpc/react";
import { PlanCreator } from "./plan-creator";
import { Button } from "@/components/ui/button";
import { CalendarCheck2, Trash2, Eye, Calendar } from "lucide-react";
import { StaggerList } from "@/components/animation/stagger-list";

export const PlanList = ({
  onSelectPlan,
}: {
  onSelectPlan: (planId: string) => void;
}) => {
  const { data: plans, isLoading } = api.planner.getPlans.useQuery();
  const utils = api.useUtils();

  const deletePlan = api.planner.deletePlan.useMutation({
    onSuccess: () => {
      void utils.planner.getPlans.invalidate();
    },
  });

  return (
    <div className="animate-in fade-in mx-auto flex size-full max-w-5xl flex-col space-y-8 p-4 duration-300 md:p-8">
      <div className="border-border flex flex-col items-start justify-between gap-4 border-b-4 pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">
            Study Plans
          </h2>
          <p className="text-muted-foreground font-base mt-2">
            AI-generated schedules to maximize your study time.
          </p>
        </div>
        <PlanCreator />
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground animate-pulse text-lg font-bold tracking-widest uppercase">
            Loading plans...
          </p>
        </div>
      ) : !plans || plans.length === 0 ? (
        <div className="border-border rounded-base bg-secondary-background/50 flex flex-1 flex-col items-center justify-center border-4 border-dashed p-12 text-center">
          <CalendarCheck2 className="text-muted-foreground mb-4 size-16" />
          <h3 className="mb-2 text-xl font-bold uppercase">No Plans Yet</h3>
          <p className="text-muted-foreground font-base mb-6 max-w-md">
            Tell the AI your subjects, exam dates, and available hours. It will
            create a day-by-day study schedule for you.
          </p>
          <PlanCreator className="bg-main text-main-foreground hover:bg-main/90" />
        </div>
      ) : (
        <StaggerList
          className="grid grid-cols-1 gap-6 pb-20 md:grid-cols-2 lg:grid-cols-3"
          itemDistance={20}
          staggerDelay={0.08}
        >
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="group border-border rounded-base bg-secondary-background shadow-shadow relative flex flex-col border-4 p-5 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <Button
                variant="noShadow"
                size="icon"
                onClick={() => deletePlan.mutate({ planId: plan.id })}
                disabled={deletePlan.isPending}
                className="rounded-base text-main-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10 absolute top-3 right-3 border-2 border-transparent transition-all group-hover:opacity-100 md:opacity-0"
              >
                <Trash2 className="size-4" />
              </Button>

              <div className="mb-6 flex-1 space-y-3">
                <h3 className="line-clamp-2 pr-8 text-xl leading-tight font-black">
                  {plan.title}
                </h3>
                <div className="text-muted-foreground flex items-center gap-2 text-sm font-bold">
                  <Calendar className="size-4" />
                  <span>
                    {plan.startDate} → {plan.endDate}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {plan.subjects.map((s, i) => (
                    <span
                      key={i}
                      className="bg-main/20 text-foreground rounded-base border-border border px-2 py-0.5 text-xs font-bold"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => onSelectPlan(plan.id)}
                className="bg-foreground text-background hover:bg-main hover:text-main-foreground hover:border-border w-full gap-2 border-2 border-transparent font-bold transition-colors"
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
