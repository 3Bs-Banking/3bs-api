import { BaseController } from "@/core/BaseController";
import { UserRole } from "@/models/User";
import { Window } from "@/models/Window";
import { BranchService } from "@/services/BranchService";
import { UserService } from "@/services/UserService";
import { WindowService } from "@/services/WindowService";
import { Request } from "express";
import Container, { Service } from "typedi";
import { FindOptionsWhere } from "typeorm";
import { z, ZodType } from "zod";

@Service()
export class WindowController extends BaseController<Window> {
  public constructor() {
    super(WindowService, {
      keySingle: "window",
      keyPlural: "windows",
      schema: z.object({
        windowNumber: z.number().int().min(1, "Window number is required"),
        type: z.string({ message: "Window type is required" }),
        status: z.string().optional(),
        branch: z.object({ id: z.string().uuid() })
      }) as unknown as ZodType<Partial<Window>>,
      relations: { branch: true }
    });
  }

  protected async validatePostBody(body: Request["body"]) {
    const parsedBody = await super.validatePostBody(body);

    const branchService = Container.get(BranchService);
    const branch = await branchService.findById(parsedBody.branch!.id!);

    if (!branch) throw new Error("Branch not found");
    return parsedBody;
  }

  protected override async getScopedWhere(
    req: Request
  ): Promise<FindOptionsWhere<Window> | null> {
    const user = (await Container.get(UserService).findById(req.user!.id, {
      bank: true,
      branch: true
    }))!;

    if (user.role === UserRole.ADMIN) return { bank: { id: user.bank.id } };
    else if (user.role === UserRole.MANAGER)
      return { branch: { id: user.branch.id } };

    return null;
  }
}
