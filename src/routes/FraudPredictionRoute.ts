import { FraudPredictionController } from "@/controllers/FraudPredictionController";
import { Router } from "express";
import Container from "typedi";

const app = Router();
const fraudPredictionController = Container.get(FraudPredictionController);

// Get all fraud predictions
app.get("/", (req, res) => fraudPredictionController.list(req, res));

// Get a fraud prediction by ID
app.get("/:id", (req, res) => fraudPredictionController.getId(req, res));

// Create a new fraud prediction
app.post("/", (req, res) => fraudPredictionController.post(req, res));

// Update an existing fraud prediction by ID
app.patch("/:id", (req, res) => fraudPredictionController.update(req, res));

// Delete a fraud prediction by ID
app.delete("/:id", (req, res) => fraudPredictionController.delete(req, res));

export default app;
