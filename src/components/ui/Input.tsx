import { cn } from "@/lib/utils";
import { forwardRef, useId, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;

    return (
      <div className="w-full">
        {label ? (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        ) : null}
        <input
          id={id}
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-lg border border-text-primary/10 bg-surface px-3 py-2 text-sm placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error focus-visible:ring-error",
            className,
          )}
          {...props}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {error ? (
          <p id={`${id}-error`} className="mt-1 text-xs text-error">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
