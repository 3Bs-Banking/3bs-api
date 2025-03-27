import { BaseController } from "@/core/BaseController";
import { Branch } from "@/models/Branch";
import { BranchService } from "@/services/BranchService";
import { Service } from "typedi";
import { z, ZodType } from "zod";

@Service()
export class BranchController extends BaseController<Branch> {
  public constructor() {
    super(BranchService, {
      keySingle: "branch",
      keyPlural: "branches",
      schema: z.object({
        name: z.string({ message: "Missing branch name" }),
        address: z.string().nullable().optional(),
        city: z.string().nullable().optional(),
        state: z.string().nullable().optional(),
        zipCode: z.string().nullable().optional(),
        contactNumber: z.string().nullable().optional(),
        latitude: z.number().nullable().optional(),
        longitude: z.number().nullable().optional(),
        totalCustomerServiceWindows: z.number().int().nullable().optional(),
        totalTellerWindows: z.number().int().nullable().optional(),
        bank: z.object({ id: z.string().uuid() })
      }) as unknown as ZodType<Partial<Branch>>
    });
  }
}
