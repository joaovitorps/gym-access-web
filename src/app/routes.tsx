import { AuthGuard, PublicOnlyGuard } from "@/features/auth/AuthGuard";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { GymsNearbyPage } from "@/features/gyms/GymsNearbyPage";
import { GymsSearchPage } from "@/features/gyms/GymsSearchPage";
import { DashboardPage } from "./DashboardPage";
import { ErrorPage } from "./ErrorPage";
import { Layout } from "./Layout";
import { NotFoundPage } from "./NotFoundPage";
import { ProfilePage } from "./ProfilePage";
import type { RouteObject } from "react-router-dom";

export const routes: RouteObject[] = [
  {
    path: "/login",
    element: (
      <PublicOnlyGuard>
        <LoginPage />
      </PublicOnlyGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/register",
    element: (
      <PublicOnlyGuard>
        <RegisterPage />
      </PublicOnlyGuard>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/",
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "gyms", element: <GymsSearchPage /> },
      { path: "gyms/nearby", element: <GymsNearbyPage /> },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
    errorElement: <ErrorPage />,
  },
];
