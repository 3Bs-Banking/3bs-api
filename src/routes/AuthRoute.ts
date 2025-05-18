import { Router } from "express";
import { register, login, logout } from "@/controllers/AuthController";

const router = Router();

router.post("/register", (req, res) => register(req, res));
router.post("/login", (req, res, next) => login(req, res, next));
router.post("/logout", (req, res) => logout(req, res));

export default router;
