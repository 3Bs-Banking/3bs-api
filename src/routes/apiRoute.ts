import { Router } from "express";
import bankRoute from "@/routes/BankRoute";
import userRoute from "@/routes/UserRoute";

const app = Router();

app.use("/bank", bankRoute);
app.use("/user", userRoute);

export default app;
