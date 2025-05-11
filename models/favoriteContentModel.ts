import mongoose, { Document, Schema } from "mongoose";

export interface IFavoriteContent extends Document {
  id: Number;
  title: string;
  icon: string;
  color: string;
  description: string;
  type: "yoga" | "meditation";
  duration?: string;
  difficulty?: string;
}

const favoriteContentSchema: Schema = new Schema<IFavoriteContent>(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["yoga", "meditation"], required: true },
    duration: { type: String },
    difficulty: { type: String },
  },
  {
    timestamps: true,
  },
);

const FavoriteContentModel = mongoose.model<IFavoriteContent>(
  "FavoriteContent",
  favoriteContentSchema,
);
export default FavoriteContentModel;
