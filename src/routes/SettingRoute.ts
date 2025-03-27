import { SettingController } from "@/controllers/SettingController";
import { Router } from "express";
import Container from "typedi";

const app = Router();
const settingController = Container.get(SettingController);

app.get("/", (req, res) => settingController.list(req, res));
app.get("/:id", (req, res) => settingController.getId(req, res));
app.post("/", (req, res) => settingController.post(req, res));
app.patch("/:id", (req, res) => settingController.update(req, res));
app.delete("/:id", (req, res) => settingController.delete(req, res));

export default app;
