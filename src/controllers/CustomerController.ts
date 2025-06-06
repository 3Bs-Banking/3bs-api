import { BaseController } from "@/core/BaseController";
import { Customer } from "@/models/Customer";
import { UserRole } from "@/models/User";
import { CustomerService } from "@/services/CustomerService";
import { UserService } from "@/services/UserService";
import { Request } from "express";
import Container, { Service } from "typedi";
import { FindOptionsWhere } from "typeorm";
import { z, ZodType } from "zod";

@Service()
export class CustomerController extends BaseController<Customer> {
  public constructor() {
    super(CustomerService, {
      keySingle: "customer",
      keyPlural: "customers",
      schema: z.object({
        fullName: z.string({ message: "Missing full name" }),
        email: z.string().email({ message: "Invalid email address" }),
        phoneNumber: z.string().nullable().optional(),
        homeLatitude: z.number().nullable().optional(),
        homeLongitude: z.number().nullable().optional(),
        preferredBranch: z
          .object({ id: z.string().uuid() })
          .nullable()
          .optional()
      }) as unknown as ZodType<Partial<Customer>>
    });
  }

  protected override async getScopedWhere(
    req: Request
  ): Promise<FindOptionsWhere<Customer> | null> {
    const user = (await Container.get(UserService).findById(req.user!.id))!;

    if (user.role === UserRole.CUSTOMER) return { email: user.email };
    return {};
  }
}
