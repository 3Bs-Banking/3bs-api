import { BaseController } from "@/core/BaseController";
import { WindowToService } from "@/models/WindowToService";
import { ServiceService } from "@/services/Service";
import { WindowService } from "@/services/WindowService";
import { WindowToServiceService } from "@/services/WindowToService";
import { Request } from "express";
import Container, { Service } from "typedi";
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

  protected async validatePostBody(body: Request["body"]) {
    const parsedBody = await super.validatePostBody(body);

    const window = await Container.get(WindowService).findById(
      parsedBody.window!.id!
    );
    if (!window) throw new Error("Window not found");

    const service = await Container.get(ServiceService).findById(
      parsedBody.service!.id!
    );
    if (!service) throw new Error("Service not found");

    return parsedBody;
  }
}
