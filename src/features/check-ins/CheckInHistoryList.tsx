import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/features/auth/AuthContext";
import { formatDateTime } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useCheckInHistory } from "./hooks";
import { ValidateCheckInButton } from "./ValidateCheckInButton";

export function CheckInHistoryList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const isAdmin = user?.role === "ADMIN";

  const { data, isLoading, error, isError } = useCheckInHistory(page);

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ["check-ins", "history"] });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load history"
        description={error.message}
        onRetry={handleRetry}
      />
    );
  }

  if (!data?.checkIns.length) {
    return (
      <EmptyState
        title="No check-ins yet"
        description="Find a gym and check in to see your history here."
      />
    );
  }

  return (
    <div className="space-y-3">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.05 } },
        }}
        className="space-y-3"
      >
        {data.checkIns.map((checkIn) => (
          <motion.div
            key={checkIn.id}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <Card className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-sm text-text-secondary">
                  {formatDateTime(checkIn.created_at)}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {checkIn.validated_at ? (
                    <span className="inline-flex items-center gap-1.5 text-success">
                      Validated
                    </span>
                  ) : (
                    <span className="text-text-secondary">Pending validation</span>
                  )}
                </p>
              </div>
              {isAdmin && !checkIn.validated_at ? (
                <ValidateCheckInButton checkInId={checkIn.id} />
              ) : null}
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <span className="font-mono text-sm text-text-secondary">Page {page}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={data.checkIns.length < 20}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
