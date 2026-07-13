import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthGuard, PublicOnlyGuard } from "@/features/auth/AuthGuard";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { GymsNearbyPage } from "@/features/gyms/GymsNearbyPage";
import { GymsSearchPage } from "@/features/gyms/GymsSearchPage";
import { DashboardPage } from "./DashboardPage";
import { Layout } from "./Layout";
import { ProfilePage } from "./ProfilePage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicOnlyGuard>
        <LoginPage />
      </PublicOnlyGuard>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicOnlyGuard>
        <RegisterPage />
      </PublicOnlyGuard>
    ),
  },
  {
    path: "/",
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "gyms", element: <GymsSearchPage /> },
      { path: "gyms/nearby", element: <GymsNearbyPage /> },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
