import { BaseController } from "@/core/BaseController";
import { User, UserRole } from "@/models/User";
import { UserService } from "@/services/UserService";
import { Request, Response } from "express";
import Container, { Service } from "typedi";
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
    const user = await Container.get(UserService).findById(req.user!.id);
    res.json({ data: { user: user } });
  }
}
