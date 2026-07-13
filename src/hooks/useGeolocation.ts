import { useCallback, useState } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  isLoading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    isLoading: false,
    error: null,
  });

  const request = useCallback(() => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: "Geolocation is not supported",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isLoading: false,
          error: null,
        });
      },
      (error) => {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: error.message || "Unable to retrieve location",
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  return { ...state, request };
}
