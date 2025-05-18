import { Router } from "express";
import AuthRoute from "@/routes/AuthRoute";
import BankRoute from "@/routes/BankRoute";
import UserRoute from "@/routes/UserRoute";
import AppointmentRoute from "@/routes/AppointmentRoute";
import BranchRoute from "@/routes/BranchRoute";
import CustomerRoute from "@/routes/CustomerRoute";
import EmployeeRoute from "@/routes/EmployeeRoute";
import FeedbackRoute from "@/routes/FeedbackRoute";
import ServiceRoute from "@/routes/ServiceRoute";
import SettingRoute from "@/routes/SettingRoute";
import WindowRoute from "@/routes/WindowRoute";
import WindowToServiceRoute from "@/routes/WindowToServiceRoute";
import FraudPredictionRoute from "@/routes/FraudPredictionRoute";
import ChurnPredictionRoute from "@/routes/ChurnPredictionRoute";

const app = Router();

app.use("/bank", BankRoute);
app.use("/user", UserRoute);
app.use("/appointment", AppointmentRoute);
app.use("/branch", BranchRoute);
app.use("/customer", CustomerRoute);
app.use("/employee", EmployeeRoute);
app.use("/feedback", FeedbackRoute);
app.use("/service", ServiceRoute);
app.use("/setting", SettingRoute);
app.use("/window", WindowRoute);
app.use("/window-to-service", WindowToServiceRoute);
app.use("/fraud-predictions", FraudPredictionRoute);
app.use("/churn-predictions", ChurnPredictionRoute);

export default app;
