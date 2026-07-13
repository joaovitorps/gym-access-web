import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/features/auth/AuthContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import { calculateDistance } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GymCard } from "./GymCard";
import { useNearbyGyms } from "./hooks";
import { RegisterGymModal } from "./RegisterGymModal";

export function GymsNearbyPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { latitude, longitude, isLoading: isLocating, error: locationError, request } = useGeolocation();
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [useManual, setUseManual] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    request();
  }, [request]);

  const activeLatitude = useManual
    ? manualLat ? Number(manualLat) : null
    : latitude;
  const activeLongitude = useManual
    ? manualLng ? Number(manualLng) : null
    : longitude;

  const { data, isLoading, error, isError } = useNearbyGyms(
    activeLatitude,
    activeLongitude,
  );

  const gymsWithDistance = useMemo(() => {
    if (!data?.gyms || activeLatitude === null || activeLongitude === null) {
      return [];
    }

    return data.gyms
      .map((gym) => ({
        ...gym,
        distance: calculateDistance(
          activeLatitude,
          activeLongitude,
          gym.latitude,
          gym.longitude,
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [data, activeLatitude, activeLongitude]);

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ["gyms", "nearby"] });
  };

  const showManualFallback = locationError || useManual;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Nearby gyms</h1>
          <p className="text-text-secondary">Gyms within 10 km</p>
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

      {isLocating && !useManual ? (
        <Card className="flex items-center gap-3 py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="text-sm text-text-secondary">Getting your location...</span>
        </Card>
      ) : null}

      {showManualFallback ? (
        <Card>
          <div className="mb-3 flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-accent" />
            <div>
              <h3 className="font-heading font-medium">Enter coordinates</h3>
              {locationError && !useManual ? (
                <p className="text-sm text-text-secondary">{locationError}</p>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={manualLat}
              onChange={(e) => {
                setManualLat(e.target.value);
                setUseManual(true);
              }}
              placeholder="-23.5216"
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={manualLng}
              onChange={(e) => {
                setManualLng(e.target.value);
                setUseManual(true);
              }}
              placeholder="-46.6712"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 gap-2"
            onClick={() => {
              setUseManual(false);
              request();
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Use my location
          </Button>
        </Card>
      ) : null}

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
      ) : gymsWithDistance.length === 0 ? (
        <EmptyState
          title="No gyms nearby"
          description="No gyms found within 10 km of your location."
        />
      ) : (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {gymsWithDistance.map((gym) => (
            <motion.div
              key={gym.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <GymCard gym={gym} distance={gym.distance} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <RegisterGymModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
