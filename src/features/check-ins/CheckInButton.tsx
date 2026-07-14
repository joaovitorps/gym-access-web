import { Button } from "@/components/ui/Button";
import { calculateDistance, formatDateTime, formatDistance } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { checkIn } from "./api";
import type { Gym } from "@/features/gyms/api";

interface CheckInButtonProps {
  gym: Gym;
  latitude: number | null;
  longitude: number | null;
  isLocating?: boolean;
}

const MAX_DISTANCE_METERS = 100;

export function CheckInButton({
  gym,
  latitude,
  longitude,
  isLocating = false,
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
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-2xl bg-accent/10 py-10 text-center"
      >
        <h2 className="text-3xl font-bold tracking-tighter text-accent">
          CHECKED IN
        </h2>
        <p className="mt-2 font-mono text-sm text-text-secondary">
          {formatDateTime(checkedInAt)}
        </p>
      </motion.div>
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
