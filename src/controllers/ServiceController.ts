import { BaseController } from "@/core/BaseController";
import { Service as ServiceEntity } from "@/models/Service";
import { BankService } from "@/services/BankService";
import { ServiceService } from "@/services/Service";
import Container, { Service } from "typedi";
import { z, ZodType } from "zod";

@Service()
export class ServiceController extends BaseController<ServiceEntity> {
  public constructor() {
    super(ServiceService, {
      keySingle: "service",
      keyPlural: "services",
      schema: z.object({
        serviceCategory: z.string({ message: "Service category is required" }),
        serviceName: z.string({ message: "Service name is required" }),
        description: z.string().nullable().optional(),
        benchmarkTime: z.number().int().nullable().optional(),
        bank: z.object({ id: z.string().uuid() })
      }) as unknown as ZodType<Partial<ServiceEntity>>,
      relations: { bank: true }
    });
  }

  protected async validatePostBody(body: Request["body"]) {
    const parsedBody = await super.validatePostBody(body);

    const bankService = Container.get(BankService);
    const bank = await bankService.findById(parsedBody.bank!.id!);

    if (!bank) throw new Error("Bank not found");
    return parsedBody;
  }
}
