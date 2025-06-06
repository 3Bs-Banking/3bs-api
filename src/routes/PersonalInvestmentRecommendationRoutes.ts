import { Router } from 'express';
import { PersonalInvestmentRecommendationController } from '../controllers/PersonalInvestmentRecommendationController';

const router = Router();
const pirController = new PersonalInvestmentRecommendationController();
router.get('/', pirController.getPersonalRecommendations);
router.get('/:customerID', pirController.getCustomerRecommendations);

export default router;
