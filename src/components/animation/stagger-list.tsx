"use client";

import {
  LazyMotion,
  domAnimation,
  m,
  MotionConfig,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import { Children, isValidElement } from "react";

interface StaggerListProps extends HTMLMotionProps<"div"> {
  staggerDelay?: number;
  itemDirection?: "up" | "down" | "left" | "right" | "none";
  itemDistance?: number;
  animateExit?: boolean;
}

export const StaggerList = ({
  children,
  staggerDelay = 0.05,
  itemDirection = "up",
  itemDistance = 15,
  animateExit = true,
  className,
  ...props
}: StaggerListProps) => {
  const directions = {
    up: { y: itemDistance, x: 0 },
    down: { y: -itemDistance, x: 0 },
    left: { x: itemDistance, y: 0 },
    right: { x: -itemDistance, y: 0 },
    none: { x: 0, y: 0 },
  };

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, ...directions[itemDirection] },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { ease: "easeOut", duration: 0.3 },
    },
    ...(animateExit && {
      exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
    }),
  };

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <m.div
          variants={container}
          initial="hidden"
          animate="show"
          {...(animateExit && { exit: "exit" })}
          className={className}
          {...props}
        >
          {Children.map(children as React.ReactNode, (child) => {
            if (isValidElement(child)) {
              return (
                <m.div key={child.key ?? undefined} variants={item}>
                  {child}
                </m.div>
              );
            }
            return child;
          })}
        </m.div>
      </LazyMotion>
    </MotionConfig>
  );
};