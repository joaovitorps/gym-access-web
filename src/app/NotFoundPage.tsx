import { Button } from "@/components/ui/Button";
import { Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
        <Dumbbell className="h-10 w-10 text-accent" />
      </div>
      <h1 className="font-heading text-4xl font-bold text-text-primary">
        404
      </h1>
      <h2 className="mt-2 font-heading text-xl font-semibold text-text-primary">
        This rack is empty
      </h2>
      <p className="mt-2 max-w-xs text-text-secondary">
        Looks like you wandered into the cardio section. There&apos;s nothing
        here.
      </p>
      <Button className="mt-6" onClick={() => navigate("/")}>
        Head back to the gym
      </Button>
    </div>
  );
}
