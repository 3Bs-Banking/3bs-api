import { BranchController } from "@/controllers/BranchController";
import { Router } from "express";
import Container from "typedi";

const app = Router();
const branchController = Container.get(BranchController);

app.get("/", (req, res) => branchController.list(req, res));
app.get("/:branch", (req, res) => branchController.getId(req, res));
app.post("/", (req, res) => branchController.post(req, res));
app.patch("/:branch", (req, res) => branchController.update(req, res));
app.delete("/:branch", (req, res) => branchController.delete(req, res));

export default app;
