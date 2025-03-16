import { BaseController } from "@/core/BaseController";
import { User, UserRole } from "@/models/User";
import { UserService } from "@/services/UserService";
import { Service } from "typedi";
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
}
