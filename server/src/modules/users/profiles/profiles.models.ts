import z from "zod";

export const createProfileModel = z.object({
  body: z.object({}),
});

export type CreateProfileModel = z.infer<typeof createProfileModel>["body"];
