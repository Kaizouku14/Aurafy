"use client";

import {
  LazyMotion,
  domAnimation,
  m,
  MotionConfig,
  type HTMLMotionProps,
} from "framer-motion";

interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}

export const FadeIn = ({
  children,
  delay = 0,
  duration = 0.4,
  direction = "up",
  distance = 20,
  className,
  ...props
}: FadeInProps) => {
  const directions = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  };

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <m.div
          initial={{
            opacity: 0,
            ...directions[direction],
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
          }}
          exit={{
            opacity: 0,
            ...directions[direction],
          }}
          transition={{
            duration,
            delay,
            ease: "easeOut",
          }}
          className={className}
          {...props}
        >
          {children}
        </m.div>
      </LazyMotion>
    </MotionConfig>
  );
};