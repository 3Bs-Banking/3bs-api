import { Router } from "express";
import Container from "typedi";
import { PersonalInvestmentRecommendationController } from "@/controllers/PersonalInvestmentRecommendationController";

const app = Router();
const controller = Container.get(PersonalInvestmentRecommendationController);

// SUBMIT questionnaire (POST) - Allows multiple submissions per customer
// Only prevents exact duplicates
// Body: { customerID, riskLevel, investmentCapacity }
app.post("/", (req, res) => controller.post(req, res));

// Note: Frontend will retrieve data directly from database
// No GET, PUT, DELETE endpoints needed

export default app;