import { BaseController } from "@/core/BaseController";
import { Setting } from "@/models/Setting";
import { SettingService } from "@/services/SettingService";
import { Service } from "typedi";
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
      }) as unknown as ZodType<Partial<Setting>>
    });
  }
}
