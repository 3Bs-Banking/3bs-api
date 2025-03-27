import { BaseController } from "@/core/BaseController";
import { Employee } from "@/models/Employee";
import { EmployeeService } from "@/services/EmployeeService";
import { Service } from "typedi";
import { z, ZodType } from "zod";

@Service()
export class EmployeeController extends BaseController<Employee> {
  public constructor() {
    super(EmployeeService, {
      keySingle: "employee",
      keyPlural: "employees",
      schema: z.object({
        fullName: z.string({ message: "Full name is required" }),
        email: z.string().email({ message: "Invalid email" }),
        phoneNumber: z.string().nullable().optional(),
        roleName: z.string().nullable().optional(),
        assignedWindowID: z.number().int().nullable().optional(),
        shiftTime: z.string().nullable().optional(),
        bank: z.object({ id: z.string().uuid() }),
        branch: z.object({ id: z.string().uuid() })
      }) as unknown as ZodType<Partial<Employee>>
    });
  }
}
