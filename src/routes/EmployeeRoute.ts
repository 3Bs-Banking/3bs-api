import { EmployeeController } from "@/controllers/EmployeeController";
import { Router } from "express";
import Container from "typedi";

const app = Router();
const employeeController = Container.get(EmployeeController);

app.get("/", (req, res) => employeeController.list(req, res));
app.get("/:employee", (req, res) => employeeController.getId(req, res));
app.post("/", (req, res) => employeeController.post(req, res));
app.patch("/:employee", (req, res) => employeeController.update(req, res));
app.delete("/:employee", (req, res) => employeeController.delete(req, res));

export default app;
