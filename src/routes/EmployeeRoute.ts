import { EmployeeController } from "@/controllers/EmployeeController";
import { Router } from "express";
import Container from "typedi";

const app = Router();
const employeeController = Container.get(EmployeeController);

app.get("/", (req, res) => employeeController.list(req, res));
app.get("/:id", (req, res) => employeeController.getId(req, res));
app.post("/", (req, res) => employeeController.post(req, res));
app.patch("/:id", (req, res) => employeeController.update(req, res));
app.delete("/:id", (req, res) => employeeController.delete(req, res));

export default app;
