import { db } from "@/server/db";
import { studyPlans } from "@/server/db/schema/planner";
import { eq } from "drizzle-orm";

export async function createPlan(
  id: string,
  userId: string,
  title: string,
  startDate: string,
  endDate: string,
  hoursPerDay: number,
  subjects: string,
  plan: string
) {
  return db.insert(studyPlans).values({
    id,
    userId,
    title,
    startDate,
    endDate,
    hoursPerDay,
    subjects,
    plan,
  });
}

export async function getUserPlans(userId: string) {
  return db.query.studyPlans.findMany({
    where: eq(studyPlans.userId, userId),
    orderBy: (plans, { desc }) => [desc(plans.createdAt)],
  });
}

export async function getPlanById(planId: string) {
  return db.query.studyPlans.findFirst({
    where: eq(studyPlans.id, planId),
  });
}

export async function deletePlanById(planId: string) {
  return db.delete(studyPlans).where(eq(studyPlans.id, planId));
}
