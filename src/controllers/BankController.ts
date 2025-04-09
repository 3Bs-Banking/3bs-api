import { BaseController } from "@/core/BaseController";
import { Bank } from "@/models/Bank";
import { BankService } from "@/services/BankService";
import { Service } from "typedi";
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
}
