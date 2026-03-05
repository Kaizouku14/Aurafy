import z from "zod";

export const loginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Invalid password" }),
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Invalid password" }),
  username: z.string().min(1, { message: "Invalid username" }),
});

export type RegisterFormSchema = z.infer<typeof registerFormSchema>;
