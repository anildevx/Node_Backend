import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import { config } from "./config/config";
import connectDB from "./config/db";
import routes from "./routes";
import { requestLogger } from "./middlewares/requestLogger";
import { errorHandler } from "./middlewares/errorHandler";
import { requireAdmin } from "./middlewares/authMiddleware";

const app = express();
const PORT = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(requestLogger);
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(express.static("admin-dashboard/dist"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api", routes);

// Static files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Admin SPA route
app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(__dirname, "admin-dashboard/dist", "index.html"));
});

// Error handler
app.use(errorHandler);

// Connect DB and start server
connectDB().then(() => {
  app.listen(config.port, () => console.log(`Server running on port ${PORT}`));
});
