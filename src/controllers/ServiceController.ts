import { BaseController } from "@/core/BaseController";
import { Service as ServiceEntity } from "@/models/Service";
import { ServiceService } from "@/services/Service";
import { Service } from "typedi";
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
      }) as unknown as ZodType<Partial<ServiceEntity>>
    });
  }
}
