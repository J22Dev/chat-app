import z from "zod";

export const userUpdateModel = z.object({
  params: z.object({
    userId: z.string().min(1),
  }),
  body: z.object({
    firstName: z.string().min(2).max(20),
    lastName: z.string().min(2).max(20),
    userName: z.string().min(6).max(20),
    email: z.string().email(),
    password: z
      .string()
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/g,
        "One Upper, One Lower, One Special, One Number, 8 - 16 Characters"
      ),
    newPassword: z
      .string()
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/g,
        "One Upper, One Lower, One Special, One Number, 8 - 16 Characters"
      )
      .optional(),
  }),
});
export type UserUpdateModel = z.infer<typeof userUpdateModel>["body"];

export const getUsersModel = z.object({
  query: z.object({
    query: z.string().min(1),
    page: z
      .string()
      .min(1)
      .max(3)
      .refine(
        (page) => {
          let p = parseInt(page);
          return p >= 1;
        },
        { message: "Page Must Be Greater Than Or Equal To 1" }
      ),
    size: z
      .string()
      .min(1)
      .max(3)
      .refine(
        (size) => {
          let s = parseInt(size);
          return s == 10 || s == 20 || s == 30;
        },
        { message: "Size Must Be 10, 20, or 30." }
      ),
  }),
});

export type GetUsersModel = z.infer<typeof getUsersModel>["query"];
