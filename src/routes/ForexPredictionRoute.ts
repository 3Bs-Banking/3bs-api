import { Router } from "express";
import { Container } from "typedi";
import { ForexPredictionController } from "@/controllers/ForexPredictionController";

const router = Router();
const controller = Container.get(ForexPredictionController);

router.get("/", (req, res) => controller.getLast(req, res));

export default router;