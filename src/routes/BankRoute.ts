import { BankController } from "@/controllers/BankController";
import { Router } from "express";
import Container from "typedi";

const app = Router();

const bankController = Container.get(BankController);

app.get("/", bankController.list);
app.get("/:bank", bankController.getId);
app.post("/", bankController.post);
app.patch("/:bank", bankController.update);
app.delete("/:bank", bankController.delete);

export default app;
