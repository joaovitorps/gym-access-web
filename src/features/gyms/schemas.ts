import { z } from "zod";

export const gymSearchSchema = z.object({
  q: z.string().min(1, "Search term is required"),
});

export const registerGymSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

export type GymSearchInput = z.infer<typeof gymSearchSchema>;
export type RegisterGymInput = z.infer<typeof registerGymSchema>;
