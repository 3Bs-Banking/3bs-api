// controllers/userInfoController.ts
import { Request, Response } from "express";
import { UserInfoService } from "@/services/UserInfoService";

export class UserInfoController {
  private userInfoService: UserInfoService;

  constructor() {
    this.userInfoService = new UserInfoService();
  }

  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    // Empty controller - add logic later
    res.status(200).json({});
  };
}
