import { Button } from "@/components/ui/Button";
import { calculateDistance, formatDateTime, formatDistance } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { checkIn } from "./api";
import type { Gym } from "@/features/gyms/api";

interface CheckInButtonProps {
  gym: Gym;
  latitude: number | null;
  longitude: number | null;
  isLocating?: boolean;
  hasCheckedInToday?: boolean;
  checkedInTodayGymId?: string | null;
  checkedInTodayCreatedAt?: string | null;
}

const MAX_DISTANCE_METERS = 100;

interface CheckInSuccessProps {
  checkedInAt: string;
  label?: string;
}

export function CheckInSuccess({
  checkedInAt,
  label = "Checked in",
}: CheckInSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col gap-0.5 py-3"
    >
      <div className="flex items-center gap-1.5">
        <Check className="h-4 w-4 text-accent" />
        <span className="text-sm font-medium text-text-primary">{label}</span>
      </div>
      <span className="font-mono text-xs text-text-secondary">
        {formatDateTime(checkedInAt)}
      </span>
    </motion.div>
  );
}

export function CheckInButton({
  gym,
  latitude,
  longitude,
  isLocating = false,
  hasCheckedInToday = false,
  checkedInTodayGymId = null,
  checkedInTodayCreatedAt = null,
}: CheckInButtonProps) {
  const queryClient = useQueryClient();
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({
      gymId,
      latitude,
      longitude,
    }: {
      gymId: string;
      latitude: number;
      longitude: number;
    }) => checkIn(gymId, latitude, longitude),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["check-ins", "history"] });
      queryClient.invalidateQueries({ queryKey: ["check-ins", "metrics"] });
      setCheckedInAt(new Date().toISOString());
    },
    onError: (error) => {
      toast.error(error.message || "Could not check in");
    },
  });

  if (checkedInAt) {
    return <CheckInSuccess checkedInAt={checkedInAt} />;
  }

  if (
    hasCheckedInToday &&
    checkedInTodayGymId === gym.id &&
    checkedInTodayCreatedAt
  ) {
    return (
      <CheckInSuccess
        checkedInAt={checkedInTodayCreatedAt}
        label="Checked in here today"
      />
    );
  }

  if (hasCheckedInToday && checkedInTodayGymId !== gym.id) {
    return (
      <Button size="sm" className="relative gap-2" disabled>
        <Check className="h-5 w-5" />
        Already checked in today
      </Button>
    );
  }

  const distance =
    latitude !== null && longitude !== null
      ? calculateDistance(latitude, longitude, gym.latitude, gym.longitude)
      : null;

  const isWithinRange = distance !== null && distance <= MAX_DISTANCE_METERS;

  const handleCheckIn = () => {
    if (latitude === null || longitude === null) {
      toast.error("Location is required to check in");
      return;
    }

    mutation.mutate({ gymId: gym.id, latitude, longitude });
  };

  return (
    <div className="relative">
      {isWithinRange ? (
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-accent"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      ) : null}

      <Button
        size="sm"
        className="relative gap-2"
        onClick={handleCheckIn}
        disabled={mutation.isPending || isLocating || (distance !== null && !isWithinRange)}
      >
        {mutation.isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <MapPin className="h-5 w-5" />
        )}
        {mutation.isPending
          ? "Checking in..."
          : isWithinRange
            ? `Check in (${formatDistance(distance!)} away)`
            : distance !== null
              ? `Too far (${formatDistance(distance)} away)`
              : isLocating
                ? "Getting location..."
                : "Enter location manually"}
      </Button>
    </div>
  );
}
