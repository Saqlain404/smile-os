"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FloatingCard({
  children,
  className,
  delay = 0,
}: FloatingCardProps) {
  return (
    <motion.div
      animate={{
        y: [0, -8, 0],
        rotate: [0, 0.5, -0.5, 0],
      }}
      transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, delay }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}
