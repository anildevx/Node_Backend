import mongoose, { Document, Schema } from "mongoose";

export interface IMeditationCategory extends Document {
  title: string;
  icon: string;
  color: string;
  description: string;
  duration: string;
  difficulty: string;
  type: string;
}

const meditationCategorySchema: Schema = new Schema<IMeditationCategory>(
  {
    title: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    difficulty: { type: String, required: true },
    type: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const MeditationCategoryModel = mongoose.model<IMeditationCategory>(
  "MeditationCategory",
  meditationCategorySchema,
);
export default MeditationCategoryModel;
