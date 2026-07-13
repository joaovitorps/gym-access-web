import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ApiError } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { registerGym } from "./api";
import { registerGymSchema, type RegisterGymInput } from "./schemas";

interface RegisterGymModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterGymModal({ isOpen, onClose }: RegisterGymModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterGymInput>({
    resolver: zodResolver(registerGymSchema),
    defaultValues: {
      description: "",
      phone: "",
    },
  });

  const mutation = useMutation({
    mutationFn: registerGym,
    onSuccess: () => {
      toast.success("Gym registered successfully");
      queryClient.invalidateQueries({ queryKey: ["gyms"] });
      reset();
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 403) {
        toast.error("You don't have permission to do that.");
        return;
      }

      toast.error(error.message || "Could not register gym");
    },
  });

  const onSubmit = (data: RegisterGymInput) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register a gym">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Title"
          placeholder="Gym name"
          error={errors.title?.message}
          {...register("title")}
        />

        <Input
          label="Description"
          placeholder="Optional description"
          error={errors.description?.message}
          {...register("description")}
        />

        <Input
          label="Phone"
          placeholder="Optional phone"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Latitude"
            type="number"
            step="any"
            placeholder="-23.5216"
            error={errors.latitude?.message}
            {...register("latitude")}
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            placeholder="-46.6712"
            error={errors.longitude?.message}
            {...register("longitude")}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            isLoading={mutation.isPending}
          >
            Register
          </Button>
        </div>
      </form>
    </Modal>
  );
}
