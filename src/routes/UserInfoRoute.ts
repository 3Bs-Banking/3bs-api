// routes/userInfoRoutes.ts
import { Router } from "express";
import { UserInfoController } from "@/controllers/UserInfoController";

const router = Router();
const userInfoController = new UserInfoController();

router.get("/UserInfo", userInfoController.getCurrentUser);

export default router;
