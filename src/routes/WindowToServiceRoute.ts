import { WindowToServiceController } from "@/controllers/WindowToServiceController";
import { Router } from "express";
import Container from "typedi";

const app = Router();
const windowToServiceController = Container.get(WindowToServiceController);

app.get("/", (req, res) => windowToServiceController.list(req, res));
app.get("/:windowToService", (req, res) =>
  windowToServiceController.getId(req, res)
);
app.post("/", (req, res) => windowToServiceController.post(req, res));
app.patch("/:windowToService", (req, res) =>
  windowToServiceController.update(req, res)
);
app.delete("/:windowToService", (req, res) =>
  windowToServiceController.delete(req, res)
);

export default app;
