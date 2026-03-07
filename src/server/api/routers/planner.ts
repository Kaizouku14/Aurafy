import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { generateStudyPlan } from "@/lib/ai/planner-ai";
import { createPlan, getUserPlans, getPlanById, deletePlanById } from "@/lib/api/planner/queries";
import { format } from "date-fns";

export const plannerRouter = createTRPCRouter({
  generatePlan: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        hoursPerDay: z.number().min(1).max(16),
        subjects: z.array(
          z.object({
            name: z.string().min(1),
            examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          })
        ).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const days = await generateStudyPlan(
        input.subjects,
        input.startDate,
        input.endDate,
        input.hoursPerDay
      );

      if (!days || days.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate a study plan.",
        });
      }

      const planId = nanoid();
      await createPlan(
        planId,
        ctx.session.user.id,
        input.title,
        input.startDate,
        input.endDate,
        input.hoursPerDay,
        JSON.stringify(input.subjects),
        JSON.stringify(days)
      );

      return { planId, daysCount: days.length };
    }),

  getPlans: protectedProcedure.query(async ({ ctx }) => {
    const plans = await getUserPlans(ctx.session.user.id);
    return plans.map((p) => ({
      ...p,
      subjects: JSON.parse(p.subjects) as { name: string; examDate: string }[],
    }));
  }),

  getPlan: protectedProcedure
    .input(z.object({ planId: z.string() }))
    .query(async ({ ctx, input }) => {
      const plan = await getPlanById(input.planId);

      if (!plan || plan.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found" });
      }

      return {
        ...plan,
        subjects: JSON.parse(plan.subjects) as { name: string; examDate: string }[],
        plan: JSON.parse(plan.plan) as { date: string; blocks: { time: string; subject: string; activity: string; duration: number }[] }[],
      };
    }),

  deletePlan: protectedProcedure
    .input(z.object({ planId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const plan = await getPlanById(input.planId);

      if (!plan || plan.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found" });
      }

      await deletePlanById(input.planId);
      return { success: true };
    }),
});
