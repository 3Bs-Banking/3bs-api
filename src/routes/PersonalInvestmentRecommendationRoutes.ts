import { Router } from "express";
import Container from "typedi";
import { PersonalInvestmentRecommendationController } from "@/controllers/PersonalInvestmentRecommendationController";

const app = Router();
const controller = Container.get(PersonalInvestmentRecommendationController);

app.get("/", (req, res) => controller.list(req, res));
app.get("/:recommendation", (req, res) => controller.getId(req, res));
app.post("/", (req, res) => controller.post(req, res));
app.patch("/:recommendation", (req, res) => controller.update(req, res));
app.delete("/:recommendation", (req, res) => controller.delete(req, res));

export default app;
