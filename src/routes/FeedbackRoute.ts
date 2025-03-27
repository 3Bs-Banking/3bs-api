import { FeedbackController } from "@/controllers/FeedbackController";
import { Router } from "express";
import Container from "typedi";

const app = Router();
const feedbackController = Container.get(FeedbackController);

app.get("/", (req, res) => feedbackController.list(req, res));
app.get("/:id", (req, res) => feedbackController.getId(req, res));
app.post("/", (req, res) => feedbackController.post(req, res));
app.patch("/:id", (req, res) => feedbackController.update(req, res));
app.delete("/:id", (req, res) => feedbackController.delete(req, res));

export default app;
