import { Card } from "@/components/ui/Card";
import { useAuth } from "@/features/auth/AuthContext";
import { CheckInHistoryList } from "@/features/check-ins/CheckInHistoryList";
import { CheckInMetricsCard } from "@/features/check-ins/CheckInMetricsCard";
import { useCheckInMetrics } from "@/features/check-ins/hooks";
import { RegisterGymModal } from "@/features/gyms/RegisterGymModal";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Dumbbell, MapPin, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const { data: metrics, isLoading: isMetricsLoading, isError: isMetricsError, error: metricsError } =
    useCheckInMetrics();

  return (
    <div className="space-y-6 p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold">
          Hello, {user?.name?.split(" ")[0] || "Athlete"}
        </h1>
        <p className="text-text-secondary">Ready for today&apos;s workout?</p>
      </div>

      {isMetricsLoading ? (
        <Skeleton className="h-36" />
      ) : isMetricsError ? (
        <ErrorState title="Could not load metrics" description={metricsError.message} />
      ) : (
        <CheckInMetricsCard total={metrics?.userTotalOfCheckIns ?? 0} />
      )}

      <div>
        <h2 className="mb-3 font-heading text-lg font-semibold">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link to="/gyms">
            <Card className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center transition-transform hover:scale-[1.02]">
              <Dumbbell className="h-6 w-6 text-accent" />
              <span className="text-sm font-medium">Find gyms</span>
            </Card>
          </Link>
          <Link to="/gyms/nearby">
            <Card className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center transition-transform hover:scale-[1.02]">
              <MapPin className="h-6 w-6 text-accent" />
              <span className="text-sm font-medium">Nearby</span>
            </Card>
          </Link>
          {isAdmin ? (
            <>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="text-left"
              >
                <Card className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center transition-transform hover:scale-[1.02]">
                  <Plus className="h-6 w-6 text-accent" />
                  <span className="text-sm font-medium">Register gym</span>
                </Card>
              </button>
              <Link to="/profile">
                <Card className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center transition-transform hover:scale-[1.02]">
                  <ShieldCheck className="h-6 w-6 text-accent" />
                  <span className="text-sm font-medium">Admin tools</span>
                </Card>
              </Link>
            </>
          ) : null}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-heading text-lg font-semibold">Recent history</h2>
        <CheckInHistoryList />
      </div>

      <RegisterGymModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
}
