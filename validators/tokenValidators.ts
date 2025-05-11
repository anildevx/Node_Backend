import { z } from "zod";

export const JwtPayloadSchema = z.object({
  userId: z.string(),
  email: z.string().optional(),
  role: z.string().optional(),
});
