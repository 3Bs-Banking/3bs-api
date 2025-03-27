import { CustomerController } from "@/controllers/CustomerController";
import { Router } from "express";
import Container from "typedi";

const app = Router();
const customerController = Container.get(CustomerController);

app.get("/", (req, res) => customerController.list(req, res));
app.get("/:id", (req, res) => customerController.getId(req, res));
app.post("/", (req, res) => customerController.post(req, res));
app.patch("/:id", (req, res) => customerController.update(req, res));
app.delete("/:id", (req, res) => customerController.delete(req, res));

export default app;
