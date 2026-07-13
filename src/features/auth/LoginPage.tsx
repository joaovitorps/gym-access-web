import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { login } from "./api";
import { useAuth } from "./AuthContext";
import { loginSchema, type LoginInput } from "./schemas";

export function LoginPage() {
  const { login: setAuthToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ token }) => {
      setAuthToken(token);
      const from = (location.state as { from?: { pathname?: string } })?.from
        ?.pathname;
      navigate(from || "/", { replace: true });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 400) {
        setFormError("Invalid email or password");
        return;
      }

      toast.error(error.message || "Could not sign in");
    },
  });

  const onSubmit = (data: LoginInput) => {
    setFormError(null);
    mutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-center text-3xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Sign in to access your gyms and check-ins
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-4"
          noValidate
        >
          {formError ? (
            <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
              {formError}
            </div>
          ) : null}

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={mutation.isPending}
          >
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-accent hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
