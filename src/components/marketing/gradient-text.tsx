"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  gradient?: string;
}

export function GradientText({
  children,
  className,
  gradient = "linear-gradient(90deg, #2563eb 0%, #06b6d4 50%, #34d399 100%)",
}: GradientTextProps) {
  return (
    <motion.span
      className={cn("inline bg-clip-text text-transparent", className)}
      style={{
        backgroundImage: gradient,
        backgroundSize: "200% auto",
      }}
      animate={{ backgroundPosition: ["0% 50%", "200% 50%", "0% 50%"] }}
      transition={{ duration: 6, ease: "linear", repeat: Infinity }}
    >
      {children}
    </motion.span>
  );
}
