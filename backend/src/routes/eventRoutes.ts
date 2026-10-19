import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getEvent,
  getEvents,
  updateEvent,
} from "../controllers/eventController";

export const eventRoutes = Router();
eventRoutes.get("/", getEvents);
eventRoutes.get("/:id", getEvent);
eventRoutes.post("/", createEvent);
eventRoutes.put("/:id", updateEvent);
eventRoutes.delete("/:id", deleteEvent);
