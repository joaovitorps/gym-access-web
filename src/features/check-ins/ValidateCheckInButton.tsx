import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { validateCheckIn } from "./api";

interface ValidateCheckInButtonProps {
  checkInId: string;
}

export function ValidateCheckInButton({
  checkInId,
}: ValidateCheckInButtonProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: validateCheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["check-ins", "history"] });
      toast.success("Check-in validated");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 403) {
        toast.error("You don't have permission to do that.");
        return;
      }

      toast.error(error.message || "Could not validate check-in");
    },
  });

  return (
    <Button
      variant="secondary"
      size="sm"
      className="gap-1.5"
      onClick={() => mutation.mutate(checkInId)}
      isLoading={mutation.isPending}
    >
      <ShieldCheck className="h-4 w-4" />
      Validate
    </Button>
  );
}
