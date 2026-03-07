"use client";

import React, { useState } from "react";
import { PlanList } from "./plan-list";
import { PlanViewer } from "./plan-viewer";
import { ScrollArea } from "@/components/ui/scroll-area";

const PlannerTab = () => {
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  return (
    <ScrollArea className="size-full bg-background">
      {activePlanId ? (
        <PlanViewer planId={activePlanId} onBack={() => setActivePlanId(null)} />
      ) : (
        <PlanList onSelectPlan={(planId) => setActivePlanId(planId)} />
      )}
    </ScrollArea>
  );
};

export default PlannerTab;
