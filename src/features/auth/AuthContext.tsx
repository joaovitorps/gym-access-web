import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { setApiToken } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { getProfile, refreshToken, type User } from "./api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setApiToken(null);
    setToken(null);
    setUser(null);
    queryClient.clear();
  }, []);

  useEffect(() => {
    refreshToken()
      .then(({ token }) => {
        setApiToken(token);
        setToken(token);
        return getProfile();
      })
      .then(({ user }) => setUser(user))
      .catch(() => {
        logout();
      })
      .finally(() => setIsLoading(false));
  }, [logout]);

  const login = useCallback((newToken: string) => {
    setApiToken(newToken);
    setToken(newToken);
    getProfile().then(({ user }) => setUser(user));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
