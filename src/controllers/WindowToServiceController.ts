import { BaseController } from "@/core/BaseController";
import { WindowToService } from "@/models/WindowToService";
import { WindowToServiceService } from "@/services/WindowToService";
import { Service } from "typedi";
import { z, ZodType } from "zod";

@Service()
export class WindowToServiceController extends BaseController<WindowToService> {
  public constructor() {
    super(WindowToServiceService, {
      keySingle: "windowToService",
      keyPlural: "windowToServices",
      schema: z.object({
        window: z.object({ id: z.string().uuid() }),
        service: z.object({ id: z.string().uuid() })
      }) as unknown as ZodType<Partial<WindowToService>>
    });
  }
}
