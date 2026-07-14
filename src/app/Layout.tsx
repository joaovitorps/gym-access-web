import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Home,
  LogOut,
  MapPin,
  Shield,
  User,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/gyms", icon: Dumbbell, label: "Gyms" },
  { to: "/gyms/nearby", icon: MapPin, label: "Nearby" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-text-primary/10 bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight"
          >
            <img src="/favicon.svg" alt="" className="h-6 w-6" />
            Gym Access
          </Link>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                <Shield className="h-3 w-3" />
                Admin
              </span>
            ) : null}
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="sticky bottom-0 z-30 border-t border-text-primary/10 bg-surface">
        <div className="mx-auto flex max-w-3xl justify-around px-2 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-accent"
                    : "text-text-secondary hover:text-text-primary"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
