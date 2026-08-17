import { cn } from "@/lib/utils";
import { FileX, SearchX, AlertTriangle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

const icons = {
  empty: Inbox,
  noResults: SearchX,
  error: AlertTriangle,
  noData: FileX,
};

interface EmptyStateProps {
  type?: keyof typeof icons;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  type = "empty",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = icons[type];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}
