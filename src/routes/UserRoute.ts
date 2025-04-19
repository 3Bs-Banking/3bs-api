import { UserController } from "@/controllers/UserController";
import { Router } from "express";
import Container from "typedi";

const app = Router();

const controller = Container.get(UserController);

app.get("/", (req, res) => controller.list(req, res));
// app.get("/:user", (req, res) => controller.getId(req, res));
// app.post("/", (req, res) => controller.post(req, res));
// app.patch("/:user", (req, res) => controller.update(req, res));
// app.delete("/:user", (req, res) => controller.delete(req, res));

export default app;
