import z from "zod";

export const updateUserModel = z.object({
  body: z.object({
    firstName: z.string().min(2).max(20),
    lastName: z.string().min(2).max(20),
    email: z.string().email(),
    password: z
      .string()
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/g,
        "One Upper, One Lower, One Special, One Number, 8 - 16 Characters"
      ),
    userName: z.string().min(6).max(20),
    newPassword: z
      .string()
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/g,
        "One Upper, One Lower, One Special, One Number, 8 - 16 Characters"
      )
      .optional(),
  }),
});

export type UpdateUserModel = z.infer<typeof updateUserModel>["body"];

export const getManyUsersModel = z.object({
  query: z.object({
    search: z.string().min(1),
    page: z.string().optional(),
    size: z.string().optional(),
  }),
});
export type GetManyUsersModel = z.infer<typeof getManyUsersModel>["query"];

export const getUserByIdModel = z.object({
  params: z.object({
    userId: z.string().min(1),
  }),
});
export type GetUserByIdModel = z.infer<typeof getUserByIdModel>["params"];
