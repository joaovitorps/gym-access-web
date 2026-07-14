import { Button } from "@/components/ui/Button";
import { Dumbbell } from "lucide-react";

export function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error/10">
        <Dumbbell className="h-10 w-10 text-error" />
      </div>
      <h1 className="font-heading text-3xl font-bold text-text-primary">
        This set didn&apos;t go as planned
      </h1>
      <p className="mt-2 max-w-xs text-text-secondary">
        We dropped the weights on this one. Give it another shot.
      </p>
      <Button
        className="mt-6 gap-2"
        onClick={() => window.location.reload()}
      >
        Rerack and retry
      </Button>
    </div>
  );
}
