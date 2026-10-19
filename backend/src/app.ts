import express, { type ErrorRequestHandler } from "express";
import { ValidationError } from "sequelize";
import { swaggerDocument, swaggerHtml } from "./config/swagger";
import { eventRoutes } from "./routes/eventRoutes";

export const app = express();
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
  if (typeof error === "object" && error !== null && "status" in error && error.status === 400) {
    res.status(400).json({ error: "Invalid JSON request" });
    return;
  }
  res.status(500).json({ error: "Internal server error" });
};
app.use(handleError);
