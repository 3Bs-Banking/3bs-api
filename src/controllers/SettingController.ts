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
        maxAppointments: z.number().int().min(1, "Must be at least 1"),
        workingHoursStart: z.string(),
        workingHoursEnd: z.string(),
        appointmentDurationMinutes: z.number().int().positive(),
        window: z.object({ id: z.string().uuid() })
      }) as unknown as ZodType<Partial<Setting>>
    });
  }
}
