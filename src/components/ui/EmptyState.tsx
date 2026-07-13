import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "Nothing here",
  description = "No items to show right now.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-background">
        <Inbox className="h-6 w-6 text-text-secondary" />
      </div>
      <h3 className="font-heading text-base font-medium text-text-primary">
        {title}
      </h3>
      <p className="mt-1 max-w-xs text-sm text-text-secondary">{description}</p>
    </div>
  );
}
