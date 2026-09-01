import { motion, type HTMLMotionProps, type Transition } from "motion/react";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export const spring: Transition = { type: "spring", stiffness: 480, damping: 16, mass: 0.7 };

/** Fade + slide up with a slight overshoot; staggers via `index`. */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <div className={cn("transition-all duration-300", className)}>
      {children}
    </div>
  );
}


type BounceButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "outline" | "soft";
  size?: "md" | "lg";
};

export function BounceButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: BounceButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.94 }}
      transition={spring}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[10px] font-medium tracking-wide",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        size === "lg" ? "px-8 py-4 text-base" : "px-5 py-2.5 text-sm",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-accent",
        variant === "outline" &&
          "border border-primary text-primary hover:border-accent hover:bg-accent hover:text-accent-foreground",
        variant === "soft" && "bg-soft text-soft-foreground hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}
