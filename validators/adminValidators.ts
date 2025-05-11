import { z } from "zod";

export const ToggleVerificationSchema = z.object({
  userId: z.string().length(24, "Invalid user ID format"),
});

export const YogaCategorySchema = z.object({
  title: z.string(),
  icon: z.string(),
  color: z.string(),
  description: z.string(),
  type: z.string(),
});

export const MeditationCategorySchema = z.object({
  title: z.string(),
  icon: z.string(),
  color: z.string(),
  description: z.string(),
  duration: z.string(),
  difficulty: z.string(),
  type: z.string(),
});

export const FavoriteContentSchema = z.object({
  title: z.string(),
  icon: z.string(),
  color: z.string(),
  description: z.string(),
  type: z.enum(["yoga", "meditation"]),
  duration: z.string().optional(),
  difficulty: z.string().optional(),
});

export const PoseSchema = z.object({
  category: z.string(),
  subCategory: z.string(),
  title: z.string(),
  videoId: z.string(),
  duration: z.string(),
  level: z.string(),
  description: z.string(),
  steps: z.array(z.string()),
  benefits: z.array(z.string()),
  cautions: z.string(),
  instructor: z.string(),
});
