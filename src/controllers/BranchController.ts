import { BaseController } from "@/core/BaseController";
import { Branch } from "@/models/Branch";
import { UserRole } from "@/models/User";
import { BankService } from "@/services/BankService";
import { BranchService } from "@/services/BranchService";
import { UserService } from "@/services/UserService";
import { Request, Response } from "express";
import Container, { Service } from "typedi";
import { FindOptionsWhere } from "typeorm";
import { z, ZodType } from "zod";

@Service()
export class BranchController extends BaseController<Branch> {
  public constructor() {
    super(BranchService, {
      keySingle: "branch",
      keyPlural: "branches",
      schema: z.object({
        name: z.string({ message: "Missing body parameter [name]" }),
        address: z.string().nullable().optional(),
        city: z.string().nullable().optional(),
        state: z.string().nullable().optional(),
        zipCode: z.string().nullable().optional(),
        contactNumber: z.string().nullable().optional(),
        latitude: z.number().nullable().optional(),
        longitude: z.number().nullable().optional(),
        totalCustomerServiceWindows: z.number().int().nullable().optional(),
        totalTellerWindows: z.number().int().nullable().optional(),
        bank: z.object({
          id: z
            .string({ message: "Missing body parameter [bank]" })
            .uuid({ message: "Invalid uuid" })
        })
      }) as unknown as ZodType<Partial<Branch>>,
      relations: { bank: true }
    });
  }

  public override async list(req: Request, res: Response): Promise<void> {
    const user = (await Container.get(UserService).findById(req.user!.id))!;

    if (user.role !== UserRole.CUSTOMER) return super.list(req, res);

    if (!req.query.bankId || typeof req.query.bankId !== "string") {
      res.status(404).json({
        error: { message: "Missing or invalid [bankId] query parameter" }
      });
      return;
    }

    const entities = await this.service.find({
      bank: { id: req.query.bankId }
    });

    res.json({
      data: {
        branches: entities.map((branch) => ({
          id: branch.id,
          name: branch.name,
          address: branch.address,
          city: branch.city,
          state: branch.state,
          zipCode: branch.zipCode,
          contactNumber: branch.contactNumber,
          latitude: branch.latitude,
          longitude: branch.longitude
        }))
      }
    });
  }

  protected async validatePostBody(body: Request["body"]) {
    const parsedBody = await super.validatePostBody(body);

    const bankService = Container.get(BankService);
    const bank = await bankService.findById(parsedBody.bank!.id!);

    if (!bank) throw new Error("Bank not found");
    return parsedBody;
  }

  protected override async getScopedWhere(
    req: Request
  ): Promise<FindOptionsWhere<Branch> | null> {
    const user = (await Container.get(UserService).findById(req.user!.id, {
      bank: true,
      branch: true
    }))!;

    if (user.role === UserRole.ADMIN) return { bank: { id: user.bank.id } };
    else if (user.role === UserRole.MANAGER) return { id: user.branch.id };

    return null;
  }
}
