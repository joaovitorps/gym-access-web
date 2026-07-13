import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load the data. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
        <AlertTriangle className="h-6 w-6 text-error" />
      </div>
      <h3 className="font-heading text-base font-medium text-text-primary">
        {title}
      </h3>
      <p className="mt-1 max-w-xs text-sm text-text-secondary">{description}</p>
      {onRetry ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="mt-4 gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
