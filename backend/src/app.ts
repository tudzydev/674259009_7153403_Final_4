import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { ValidationError } from "sequelize";
import { swaggerDocument, swaggerHtml } from "./config/swagger";
import { eventRoutes } from "./routes/eventRoutes";

export const app = express();
const corsOrigins = (
  process.env.FRONEND_URL?.trim() ||
  "http://localhost:3000,http://localhost:3001,http://localhost:3100,http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3100,https://674259009-7153403-final-d.vercel.app"
).split(",").map((origin) => origin.trim().replace(/\/+$/, "")).filter(Boolean);

app.use(cors({
  origin: corsOrigins,
  methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  maxAge: 600,
}));
app.use(express.json());
app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerDocument);
});
app.get("/api/events/docs", (_req, res) => {
  res.type("html").send(swaggerHtml);
});
app.use("/api/events", eventRoutes);
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const handleError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof ValidationError) {
    res.status(400).json({ error: "Invalid event input" });
    return;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 400
  ) {
    res.status(400).json({ error: "Invalid JSON request" });
    return;
  }
  res.status(500).json({ error: "Internal server error" });
};
app.use(handleError);
