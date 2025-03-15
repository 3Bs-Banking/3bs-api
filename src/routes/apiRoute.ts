import { Router } from "express";
import bankRoute from "@/routes/BankRoute";

const app = Router();

app.use("/bank", bankRoute);

export default app;
