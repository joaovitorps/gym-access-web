import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label ? (
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-lg border border-text-primary/10 bg-surface px-3 py-2 text-sm placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error focus-visible:ring-error",
            className,
          )}
          {...props}
        />
        {error ? <p className="mt-1 text-xs text-error">{error}</p> : null}
      </div>
    );
  },
);

Input.displayName = "Input";
