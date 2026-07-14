import { Card } from "@/components/ui/Card";
import { formatDistance } from "@/lib/utils";
import { motion } from "framer-motion";
import { MapPin, Phone } from "lucide-react";
import type { Gym } from "./api";

interface GymCardProps {
  gym: Gym;
  distance?: number;
  action?: React.ReactNode;
}

export function GymCard({ gym, distance, action }: GymCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
    >
      <Card className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-heading text-lg font-semibold text-text-primary">
              {gym.title}
            </h3>
            {gym.description ? (
              <p className="mt-1 text-sm text-text-secondary">
                {gym.description}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1 text-sm">
            {typeof distance === "number" ? (
              <span className="font-mono text-accent">
                {formatDistance(distance)}
              </span>
            ) : null}
            {gym.phone ? (
              <span className="inline-flex items-center gap-1.5 text-text-secondary">
                <Phone className="h-4 w-4" />
                {gym.phone}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
            <MapPin className="h-4 w-4" />
            {gym.latitude.toFixed(5)}, {gym.longitude.toFixed(5)}
          </span>
          {action ? <div>{action}</div> : null}
        </div>
      </Card>
    </motion.div>
  );
}
