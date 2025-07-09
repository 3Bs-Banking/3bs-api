import { TemporaryAccessController } from "@/controllers/TemporaryAccessController";
import { Router } from "express";
import Container from "typedi";

const app = Router();
const tempAccessController = Container.get(TemporaryAccessController);

// List all temporary access records
app.get("/", (req, res) => tempAccessController.list(req, res));

// Get a specific temporary access record by ID
app.get("/:temporaryAccess", (req, res) => tempAccessController.getId(req, res));

// Create a new temporary access record (grant access)
app.post("/", (req, res) => tempAccessController.post(req, res));

// Update a temporary access record (if needed)
app.patch("/:temporaryAccess", (req, res) => tempAccessController.update(req, res));

// Delete a temporary access record (manual removal, if needed)
app.delete("/:temporaryAccess", (req, res) => tempAccessController.delete(req, res));

// Custom endpoint: Check if a user exists (for employee lookup in frontend)
app.get("/check-user/:id", (req, res) => tempAccessController.checkUser(req, res));

// Custom endpoint: Grant temporary access (with password verification, etc.)
app.post("/grant", (req, res) => tempAccessController.grant(req, res));

export default app;