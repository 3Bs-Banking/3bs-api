import { BaseController } from "@/core/BaseController";
import { Window } from "@/models/Window";
import { WindowService } from "@/services/WindowService";
import { Service } from "typedi";
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
      }) as unknown as ZodType<Partial<Window>>
    });
  }
}
