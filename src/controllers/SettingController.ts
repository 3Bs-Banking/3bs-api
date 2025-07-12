import { BaseController } from "@/core/BaseController";
import { Setting } from "@/models/Setting";
import { UserRole } from "@/models/User";
import { SettingService } from "@/services/SettingService";
import { UserService } from "@/services/UserService";
import { Request } from "express";
import Container, { Service } from "typedi";
import { FindOptionsWhere } from "typeorm";
import { z, ZodType } from "zod";

@Service()
export class SettingController extends BaseController<Setting> {
  public constructor() {
    super(SettingService, {
      keySingle: "setting",
      keyPlural: "settings",
      schema: z.object({
        bank: z.object({ id: z.string().uuid() }),
        key: z.string({ message: "Missing body parameter [key]" }),
        value: z.string({ message: "Missing body parameter [value]" })
      }) as unknown as ZodType<Partial<Setting>>,
      relations: { bank: true }
    });
  }

  protected override async getScopedWhere(
    req: Request
  ): Promise<FindOptionsWhere<Setting> | null> {
    const user = (await Container.get(UserService).findById(req.user!.id, {
      bank: true,
      branch: true
    }))!;

    if (user.role === UserRole.CUSTOMER) return null;

    return { bank: { id: user.bank.id } };
  }
}
