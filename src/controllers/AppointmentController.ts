import { BaseController } from "@/core/BaseController";
import { Appointment } from "@/models/Appointment";
import { AppointmentService } from "@/services/AppointmentService";
import { AppointmentStatus, ReservationType } from "@/models/Appointment";
import Container, { Service } from "typedi";
import { z, ZodType } from "zod";
import { BranchService } from "@/services/BranchService";
import { ServiceService } from "@/services/Service";
import { CustomerService } from "@/services/CustomerService";
import { EmployeeService } from "@/services/EmployeeService";
import { Request, Response } from "express";
import { FindOptionsWhere } from "typeorm";
import { UserService } from "@/services/UserService";
import { UserRole } from "@/models/User";
import { BankService } from "@/services/BankService";

@Service()
export class AppointmentController extends BaseController<Appointment> {
  public constructor() {
    super(AppointmentService, {
      keySingle: "appointment",
      keyPlural: "appointments",
      schema: z.object({
        branch: z.object({ id: z.string().uuid() }),
        service: z.object({ id: z.string().uuid() }),
        customer: z.object({ id: z.string().uuid() }),
        // window: z.object({ id: z.string().uuid() }).nullable().optional(),
        // employee: z.object({ id: z.string().uuid() }).nullable().optional(),
        // appointmentStartDate: z
        //   .string()
        //   .min(1, "Start date is required")
        //   .nullable()
        //   .optional(),
        // appointmentStartTime: z
        //   .string()
        //   .min(1, "Start time is required")
        //   .nullable()
        //   .optional(),
        // appointmentEndDate: z.string().nullable().optional(),
        // appointmentEndTime: z.string().nullable().optional(),
        appointmentScheduledTimestamp: z.string().datetime(),
        status: z.nativeEnum(AppointmentStatus),
        reservationType: z.nativeEnum(ReservationType)
      }) as unknown as ZodType<Partial<Appointment>>,
      relations: {
        branch: true,
        service: true,
        customer: true,
        window: true,
        employee: true
      }
    });
  }

  protected async validatePostBody(body: Request["body"]) {
    const parsedBody = await super.validatePostBody(body);

    const branch = await Container.get(BranchService).findById(
      parsedBody.branch!.id!
    );
    if (!branch) throw new Error("Branch not found");

    const service = await Container.get(ServiceService).findById(
      parsedBody.service!.id!
    );
    if (!service) throw new Error("Service not found");

    const customer = await Container.get(CustomerService).findById(
      parsedBody.customer!.id!
    );
    if (!customer) throw new Error("Customer not found");

    if (parsedBody.window) {
      const window = await Container.get(CustomerService).findById(
        parsedBody.window!.id!
      );
      if (!window) throw new Error("Window not found");
    }

    if (parsedBody.employee) {
      const employee = await Container.get(EmployeeService).findById(
        parsedBody.employee!.id!
      );
      if (!employee) throw new Error("Employee not found");
    }

    parsedBody.bank = branch.bank;

    return parsedBody;
  }

  protected override async getScopedWhere(
    req: Request
  ): Promise<FindOptionsWhere<Appointment> | null> {
    const user = (await Container.get(UserService).findById(req.user!.id, {
      bank: true,
      branch: true
    }))!;

    if (user.role === UserRole.ADMIN) return { bank: { id: user.bank.id } };
    else if (user.role === UserRole.MANAGER)
      return { branch: { id: user.branch.id } };
    else if (user.role === UserRole.CUSTOMER)
      return { customer: { email: user.email } };

    return null;
  }

  public async getLength(req: Request, res: Response) {
    const querySchema = z.object({
      bankId: z.string().uuid(),
      lat: z.coerce.number(),
      long: z.coerce.number()
    });

    const queryParsed = querySchema.safeParse(req.query);

    if (!queryParsed.success) {
      res.status(400).json({
        error: {
          message: "Invalid body",
          issues: queryParsed.error.issues.map((i) => `${i.path}: ${i.message}`)
        }
      });
      return;
    }

    const { bankId, lat: userLatitude, long: userLongitude } = queryParsed.data;

    if (!(await Container.get(BankService).findById(bankId))) {
      res.status(400).json({
        error: { message: "Invalid [bankId] query parameter" }
      });
      return;
    }

    const queryResult: {
      branchId: string;
      branchName: string;
      appointmentCount: string;
      branchLongitude: string;
      branchLatitude: string;
    }[] = await this.service.query(
      `SELECT 
        b.id AS "branchId",
        b.name AS "branchName",
        b.longitude AS "branchLongitude",
        b.latitude AS "branchLatitude",
        COUNT(*) AS "appointmentCount"
      FROM appointment a
      JOIN branch b ON a.branch_id = b.id
      WHERE a.bank_id = $1 AND a.status = 'Pending'
      GROUP BY b.id, b.name;`,
      [bankId]
    );

    let formattedOutput = queryResult.map((q) => ({
      ...q,
      appointmentCount: parseInt(q.appointmentCount),
      branchLatitude: parseFloat(q.branchLatitude),
      branchLongitude: parseFloat(q.branchLongitude),
      distance: Math.sqrt(
        (userLatitude - parseFloat(q.branchLatitude)) ** 2 +
          (userLongitude - parseFloat(q.branchLongitude)) ** 2
      )
    }));

    formattedOutput.sort((a, b) => a.distance - b.distance);

    formattedOutput = formattedOutput.filter((_, i) => i < 5);

    formattedOutput.sort((a, b) => a.appointmentCount - b.appointmentCount);

    res.json({ data: { counts: formattedOutput } });
  }

  public async getLast(req: Request, res: Response) {
    const user = (await Container.get(UserService).findById(req.user!.id))!;
    if (user.role !== UserRole.CUSTOMER) {
      res.status(403).json({ error: { message: "Forbidden" } });
      return;
    }

    const queryResult = (
      await this.service.query(
        `SELECT 
          a.id AS "appointmentId",
          b.id AS "bankId",
          b.name AS "bankName",
          br.id AS "branchId",
          br.name AS "branchName",
          s.id AS "serviceId",
          s.service_name AS "serviceName",
          s.service_category AS "serviceCategory",
          s.description AS "serviceDescription"
        FROM appointment a
        JOIN customer c ON a.customer_id = c.id
        JOIN bank b ON a.bank_id = b.id
        JOIN branch br ON a.branch_id = br.id
        JOIN service s ON a.service_id = s.id
        WHERE c.email = $1 AND a.status = 'Pending'
        ORDER BY a.created_at DESC
        LIMIT 1;`,
        [user.email]
      )
    )[0];

    if (!queryResult) {
      res.json({ data: { appointment: null } });
      return;
    }

    const appointmentCount = await this.service.count({
      branch: { id: queryResult.branchId },
      status: AppointmentStatus.PENDING
    });

    res.json({
      data: {
        appointment: queryResult,
        appointmentsRemaining: appointmentCount
      }
    });
  }
}
