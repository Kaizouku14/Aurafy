"use client";

import { FadeIn } from "@/components/animation/fade-in";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <FadeIn duration={0.3} distance={15} className="h-full w-full">
      {children}
    </FadeIn>
  );
}
