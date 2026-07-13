import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "@/features/auth/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { Router } from "./Router";

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <ToastProvider />
        </AuthProvider>
      </QueryClientProvider>
    </MotionConfig>
  );
}
