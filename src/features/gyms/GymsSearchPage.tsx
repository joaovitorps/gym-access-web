import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/features/auth/AuthContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { CheckInButton } from "@/features/check-ins/CheckInButton";
import { GymCard } from "./GymCard";
import { useGymsSearch } from "./hooks";
import { RegisterGymModal } from "./RegisterGymModal";

export function GymsSearchPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    latitude,
    longitude,
    isLoading: isLocating,
    request: requestLocation,
  } = useGeolocation();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const { data, isLoading, error, isError } = useGymsSearch(debouncedQuery, page);

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ["gyms", "search"] });
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Find gyms</h1>
          <p className="text-text-secondary">Search by name</p>
        </div>
        {isAdmin ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Register gym
          </Button>
        ) : null}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <Input
          placeholder="Search gyms..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load gyms"
          description={error.message}
          onRetry={handleRetry}
        />
      ) : data?.gyms.length === 0 && debouncedQuery ? (
        <EmptyState
          title="No gyms found"
          description={`No gyms matched "${debouncedQuery}".`}
        />
      ) : data?.gyms.length ? (
        <>
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {data.gyms.map((gym) => (
              <motion.div
                key={gym.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <GymCard
                  gym={gym}
                  action={
                    <CheckInButton
                      gym={gym}
                      latitude={latitude}
                      longitude={longitude}
                      isLocating={isLocating}
                    />
                  }
                />
              </motion.div>
            ))}
          </motion.div>

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <span className="font-mono text-sm text-text-secondary">
              Page {page}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={data.gyms.length < 20}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </>
      ) : null}

      <RegisterGymModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
