import { BaseController } from "@/core/BaseController";
import { User, UserRole } from "@/models/User";
import { UserService } from "@/services/UserService";
import { Request, Response } from "express";
import Container, { Service } from "typedi";
import { DeepPartial } from "typeorm";
import { z } from "zod";

@Service()
export class UserController extends BaseController<User> {
  public constructor() {
    super(UserService, {
      keySingle: "user",
      keyPlural: "users",
      schema: z.object({ role: z.nativeEnum(UserRole) })
    });
  }

  public async list(req: Request, res: Response): Promise<void> {
    const user: DeepPartial<User> | null = await Container.get(
      UserService
    ).findById(req.user!.id, {
      bank: true
    });

    if (user) delete user.password;

    res.json({ data: { user: user } });
  }

  public async verifyPassword(req: Request, res: Response): Promise<void> {
    try {
      const sessionUser = req.user as { id: string } | undefined;
      const { password } = req.body;
      if (!sessionUser) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }
      if (!password) {
        res
          .status(400)
          .json({ success: false, message: "Password is required" });
        return;
      }
      // Fetch the full user entity from the DB
      const userService = Container.get(UserService);
      const user = await userService.findById(sessionUser.id);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
      const isValid = await user.validatePassword(password);
      if (isValid) {
        res.json({ success: true });
      } else {
        res.status(401).json({ success: false, message: "Incorrect password" });
      }
    } catch (err) {
      console.error("Password verification error:", err);
      res
        .status(500)
        .json({ success: false, message: "Server error verifying password" });
    }
  }
}
