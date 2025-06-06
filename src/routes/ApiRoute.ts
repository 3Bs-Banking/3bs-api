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
import ForexPredictionRoute from "@/routes/ForexPredictionRoute";
import { isAuthenticated } from "@/middleware/AuthMiddleware";

const app = Router();

app.use("/auth", AuthRoute);
app.use("/bank", isAuthenticated, BankRoute);
app.use("/user", isAuthenticated, UserRoute);
app.use("/appointment",  AppointmentRoute);
app.use("/branch", isAuthenticated, BranchRoute);
app.use("/customer", isAuthenticated, CustomerRoute);
app.use("/employee", isAuthenticated, EmployeeRoute);
app.use("/feedback", isAuthenticated, FeedbackRoute);
app.use("/service", isAuthenticated, ServiceRoute);
app.use("/setting", isAuthenticated, SettingRoute);
app.use("/window", isAuthenticated, WindowRoute);
app.use("/window-to-service", isAuthenticated, WindowToServiceRoute);
app.use("/fraud-predictions", isAuthenticated, FraudPredictionRoute);
app.use("/churn-predictions", isAuthenticated, ChurnPredictionRoute);
app.use("/forex-predictions", ForexPredictionRoute);

export default app;
