import mongoose, { Document, Schema } from "mongoose";

export interface IUserFavorite extends Document {
  user: mongoose.Types.ObjectId;
  favoriteContent: mongoose.Types.ObjectId[];
}

const userFavoriteSchema: Schema = new Schema<IUserFavorite>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    favoriteContent: [
      { type: mongoose.Schema.Types.ObjectId, ref: "FavoriteContent" },
    ],
  },
  {
    timestamps: true,
  },
);

const UserFavoriteModel = mongoose.model<IUserFavorite>(
  "UserFavorite",
  userFavoriteSchema,
);
export default UserFavoriteModel;
