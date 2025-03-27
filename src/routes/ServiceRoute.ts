import { ServiceController } from "@/controllers/ServiceController";
import { Router } from "express";
import Container from "typedi";

const app = Router();
const serviceController = Container.get(ServiceController);

app.get("/", (req, res) => serviceController.list(req, res));
app.get("/:id", (req, res) => serviceController.getId(req, res));
app.post("/", (req, res) => serviceController.post(req, res));
app.patch("/:id", (req, res) => serviceController.update(req, res));
app.delete("/:id", (req, res) => serviceController.delete(req, res));

export default app;
