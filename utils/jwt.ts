import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "../config/config";

type ExpiresIn = SignOptions["expiresIn"];

const signToken = (payload: object, expiresIn: ExpiresIn): string => {
  if (!config.jwt.secret) {
    throw new Error("JWT_SECRET is not set in environment");
  }

  const options: SignOptions = {
    expiresIn: expiresIn,
    algorithm: "HS256",
  };

  return jwt.sign(payload, config.jwt.secret, options);
};

const verifyToken = (token: string) => {
  if (!config.jwt.secret) {
    throw new Error("JWT_SECRET is not set in environment");
  }
  return jwt.verify(token, config.jwt.secret, { algorithms: ["HS256"] });
};

export { signToken, verifyToken };
