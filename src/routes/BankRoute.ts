import { BankController } from "@/controllers/BankController";
import { Router } from "express";
import Container from "typedi";
// Routes and Controllers
const app = Router();

const bankController = Container.get(BankController);

app.get("/", (req, res) => bankController.list(req, res));
app.get("/:bank", (req, res) => bankController.getId(req, res));
app.post("/", (req, res) => bankController.post(req, res));
app.patch("/:bank", (req, res) => bankController.update(req, res));
app.delete("/:bank", (req, res) => bankController.delete(req, res));

export default app;
