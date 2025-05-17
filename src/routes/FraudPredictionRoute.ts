import { Router } from "express";
import { FraudPredictionController } from "@/controllers/FraudPredictionController";
import Container from "typedi";

const app = Router();
const controller = Container.get(FraudPredictionController);

app.get("/", (req, res) => controller.list(req, res));
app.get("/:id", (req, res) => controller.getId(req, res));
app.post("/", (req, res) => controller.post(req, res));
app.patch("/:id", (req, res) => controller.update(req, res));
app.delete("/:id", (req, res) => controller.delete(req, res));

export default app;
