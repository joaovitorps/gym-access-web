import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/features/auth/AuthContext";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { GymCard } from "./GymCard";
import { useGymsSearch } from "./hooks";
import { RegisterGymModal } from "./RegisterGymModal";
import { gymSearchSchema, type GymSearchInput } from "./schemas";

export function GymsSearchPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GymSearchInput>({
    resolver: zodResolver(gymSearchSchema),
  });

  const { data, isLoading, error, isError } = useGymsSearch(submittedQuery, page);

  const onSearch = (data: GymSearchInput) => {
    setSubmittedQuery(data.q);
    setPage(1);
  };

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

      <form onSubmit={handleSubmit(onSearch)} className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search gyms..."
            error={errors.q?.message}
            {...register("q")}
          />
        </div>
        <Button type="submit">
          <Search className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </form>

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
      ) : data?.gyms.length === 0 && submittedQuery ? (
        <EmptyState
          title="No gyms found"
          description={`No gyms matched "${submittedQuery}".`}
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
                <GymCard gym={gym} />
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
