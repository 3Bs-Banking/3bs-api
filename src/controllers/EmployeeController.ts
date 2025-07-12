import { BaseController } from "@/core/BaseController";
import { Employee } from "@/models/Employee";
import { UserRole } from "@/models/User";
import { BranchService } from "@/services/BranchService";
import { EmployeeService } from "@/services/EmployeeService";
import { UserService } from "@/services/UserService";
import { Request } from "express";
import Container, { Service } from "typedi";
import { FindOptionsWhere } from "typeorm";
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
        branch: z.object({
          id: z
            .string({ message: "Missing body parameter [branch]" })
            .uuid({ message: "Invalid uuid" })
        })
      }) as unknown as ZodType<Partial<Employee>>,
      relations: { branch: true, bank: true }
    });
  }

  protected async validatePostBody(body: Request["body"]) {
    const parsedBody = await super.validatePostBody(body);

    const duplicateEmail = await Container.get(EmployeeService).findOne({
      email: parsedBody.email
    });

    if (duplicateEmail) throw new Error("Email already in use");

    const branchService = Container.get(BranchService);
    const branch = await branchService.findOne(
      { id: parsedBody.branch!.id! },
      { bank: true }
    );

    if (!branch) throw new Error("Branch not found");

    parsedBody.bank = branch.bank;

    return parsedBody;
  }

  protected override async getScopedWhere(
    req: Request
  ): Promise<FindOptionsWhere<Employee> | null> {
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
