import { Router } from "express";
import { Container } from "typedi";
import { ForexPredictionController } from "@/controllers/ForexPredictionController";

const router = Router();
const controller = Container.get(ForexPredictionController);

router.get("/", (req, res) => controller.list(req, res));
router.get("/:id", (req, res) => controller.getId(req, res));
router.post("/", (req, res) => controller.post(req, res));
router.delete("/:id", (req, res) => controller.delete(req, res));

export default router;
