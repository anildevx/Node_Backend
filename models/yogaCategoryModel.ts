import mongoose, { Schema, Document } from "mongoose";

export interface IYogaCategory extends Document {
  id: Number;
  title: string;
  icon: string;
  color: string;
  description: string;
  type: string;
}

const YogaCategorySchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
});

const YogaCategoryModel = mongoose.model<IYogaCategory>(
  "YogaCategory",
  YogaCategorySchema,
);
export default YogaCategoryModel;
