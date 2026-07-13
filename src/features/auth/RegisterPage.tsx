import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { register as registerUser } from "./api";
import { registerSchema, type RegisterInput } from "./schemas";

export function RegisterPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Account created. Please sign in.");
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        setError("email", { message: "Email already in use" });
        return;
      }

      toast.error(error.message || "Could not create account");
    },
  });

  const onSubmit = (data: RegisterInput) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-center text-3xl font-bold tracking-tight">
          Create account
        </h1>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Join to start checking in at gyms
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          <Input
            label="Name"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />

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
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={mutation.isPending}
          >
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
