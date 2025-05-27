import { BaseController } from "@/core/BaseController";
import { Bank } from "@/models/Bank";
import { UserRole } from "@/models/User";
import { BankService } from "@/services/BankService";
import { UserService } from "@/services/UserService";
import { Request } from "express";
import Container, { Service } from "typedi";
import { FindOptionsWhere } from "typeorm";
import { z } from "zod";

@Service()
export class BankController extends BaseController<Bank> {
  public constructor() {
    super(BankService, {
      keySingle: "bank",
      keyPlural: "banks",
      schema: z.object({
        name: z.string({ message: "Missing body parameter [name]" })
      })
    });
  }

  protected override async getScopedWhere(
    req: Request
  ): Promise<FindOptionsWhere<Bank> | null> {
    const user = (await Container.get(UserService).findById(req.user!.id, {
      bank: true
    }))!;

    if (user.role === UserRole.CUSTOMER) return null;

    return { id: user.bank.id };
  }
}
