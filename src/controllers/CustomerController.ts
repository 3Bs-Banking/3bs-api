import { BaseController } from "@/core/BaseController";
import { Customer } from "@/models/Customer";
import { CustomerService } from "@/services/CustomerService";
import { Service } from "typedi";
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
      }) as unknown as ZodType<Partial<Customer>>,
      // ADD THIS LINE - This is what you're missing!
      relations: { 
        preferredBranch: { 
          bank: true 
        } 
      }
    });
  }
}