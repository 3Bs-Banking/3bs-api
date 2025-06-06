import { AppointmentController } from "@/controllers/AppointmentController";
import { Router } from "express";
import Container from "typedi";

const app = Router();
const appointmentController = Container.get(AppointmentController);

app.get("/", (req, res) => appointmentController.list(req, res));
app.get("/length", (req, res) => appointmentController.getLength(req, res));
app.get("/last", (req, res) => appointmentController.getLast(req, res));
app.post("/customer-arrive/:appointment", (req, res) =>
  appointmentController.customerArrive(req, res)
);
app.post("/next-token", (req, res) =>
  appointmentController.getNextToken(req, res)
);
app.get("/:appointment", (req, res) => appointmentController.getId(req, res));
app.post("/", (req, res) => appointmentController.post(req, res));
app.patch("/:appointment", (req, res) =>
  appointmentController.update(req, res)
);
app.delete("/:appointment", (req, res) =>
  appointmentController.delete(req, res)
);

export default app;
