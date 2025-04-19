import { BaseController } from "@/core/BaseController";
import { UserRole } from "@/models/User";
import { WindowToService } from "@/models/WindowToService";
import { ServiceService } from "@/services/Service";
import { UserService } from "@/services/UserService";
import { WindowService } from "@/services/WindowService";
import { WindowToServiceService } from "@/services/WindowToService";
import { Request } from "express";
import Container, { Service } from "typedi";
import { FindOptionsWhere } from "typeorm";
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
      }) as unknown as ZodType<Partial<WindowToService>>,
      relations: { window: true, service: true }
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

  protected override async getScopedWhere(
    req: Request
  ): Promise<FindOptionsWhere<WindowToService>> {
    const user = (await Container.get(UserService).findById(req.user!.id, {
      bank: true,
      branch: true
    }))!;

    if (user.role === UserRole.ADMIN)
      return { window: { bank: { id: user.bank.id } } };
    else if (user.role === UserRole.MANAGER)
      return { window: { branch: { id: user.branch.id } } };

    return {};
  }
}
