import { configDotenv } from "dotenv";

configDotenv();

export const config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,

  jwt: {
    secret: process.env.JWT_SECRET,
  },

  database: {
    mongoUri: process.env.MONGODB_URI,
  },

  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};
