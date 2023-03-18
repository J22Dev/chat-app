import z from "zod";

export const createProfileModel = z.object({
  params: z.object({
    userId: z.string().min(1),
  }),
  body: z.object({
    bio: z.string().min(1).max(200),
  }),
});

export type CreateProfileModel = z.infer<typeof createProfileModel>["body"];
