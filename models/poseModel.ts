import mongoose, { Document, Schema } from "mongoose";

export interface IPose extends Document {
  category: string;
  subCategory: string;
  title: string;
  videoId: string;
  duration: string;
  level: string;
  description: string;
  steps: string[];
  benefits: string[];
  cautions: string;
  instructor: string;
}

const poseSchema: Schema = new Schema<IPose>(
  {
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    title: { type: String, required: true },
    videoId: { type: String, required: true },
    duration: { type: String, required: true },
    level: { type: String, required: true },
    description: { type: String, required: true },
    steps: { type: [String], required: true },
    benefits: { type: [String], required: true },
    cautions: { type: String, required: true },
    instructor: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const PoseModel = mongoose.model<IPose>("Pose", poseSchema);
export default PoseModel;
