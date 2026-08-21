"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GradientText } from "@/components/marketing/gradient-text";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

interface SectionHeaderProps {
  badge?: string;
  title: ReactNode;
  titleGradient?: boolean;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  titleGradient = false,
  subtitle,
  className,
}: SectionHeaderProps) {
  return (
    <ScrollReveal className={cn("mx-auto max-w-2xl text-center", className)}>
      {badge && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          {badge}
        </div>
      )}
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {titleGradient ? <GradientText>{title}</GradientText> : title}
      </h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </ScrollReveal>
  );
}
