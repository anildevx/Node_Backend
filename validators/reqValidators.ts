import { z } from "zod";

export const poseParamsSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "SubCategory is required"),
});

export const toggleFavoriteSchema = z.object({
  type: z.string().min(1, "Type is required"),
  title: z.string().min(1, "Title is required"),
});
