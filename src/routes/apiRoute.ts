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
import { isAuthenticated } from "@/middleware/AuthMiddleware";

const app = Router();

app.use("/auth", AuthRoute);
app.use("/bank", isAuthenticated, BankRoute);
app.use("/user", isAuthenticated, UserRoute);
app.use("/appointment", isAuthenticated, AppointmentRoute);
app.use("/branch", isAuthenticated, BranchRoute);
app.use("/customer", isAuthenticated, CustomerRoute);
app.use("/employee", isAuthenticated, EmployeeRoute);
app.use("/feedback", isAuthenticated, FeedbackRoute);
app.use("/service", isAuthenticated, ServiceRoute);
app.use("/setting", isAuthenticated, SettingRoute);
app.use("/window", isAuthenticated, WindowRoute);
app.use("/window-to-service", isAuthenticated, WindowToServiceRoute);

export default app;
