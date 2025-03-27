import { AppointmentController } from "@/controllers/AppointmentController";
import { Router } from "express";
import Container from "typedi";

const app = Router();
const appointmentController = Container.get(AppointmentController);

app.get("/", (req, res) => appointmentController.list(req, res));
app.get("/:id", (req, res) => appointmentController.getId(req, res));
app.post("/", (req, res) => appointmentController.post(req, res));
app.patch("/:id", (req, res) => appointmentController.update(req, res));
app.delete("/:id", (req, res) => appointmentController.delete(req, res));

export default app;
