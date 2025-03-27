import { WindowController } from "@/controllers/WindowController";
import { Router } from "express";
import Container from "typedi";

const app = Router();
const windowController = Container.get(WindowController);

app.get("/", (req, res) => windowController.list(req, res));
app.get("/:id", (req, res) => windowController.getId(req, res));
app.post("/", (req, res) => windowController.post(req, res));
app.patch("/:id", (req, res) => windowController.update(req, res));
app.delete("/:id", (req, res) => windowController.delete(req, res));

export default app;
