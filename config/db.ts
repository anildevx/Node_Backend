import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.database.mongoUri || "", {
      dbName: "YogaMed",
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
