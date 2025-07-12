import { BaseController } from "@/core/BaseController";
import { Appointment } from "@/models/Appointment";
import { AppointmentService } from "@/services/AppointmentService";
import { AppointmentStatus, ReservationType } from "@/models/Appointment";
import Container, { Service } from "typedi";
import { z, ZodError } from "zod";
import { BranchService } from "@/services/BranchService";
import { ServiceService } from "@/services/Service";
import { CustomerService } from "@/services/CustomerService";
import { EmployeeService } from "@/services/EmployeeService";
import { Request, Response } from "express";
import { FindOptionsWhere } from "typeorm";
import { UserService } from "@/services/UserService";
import { UserRole } from "@/models/User";
import { BankService } from "@/services/BankService";
import { WindowService } from "@/services/WindowService";
import { Window } from "@/models/Window";
import { Employee } from "@/models/Employee";
import moment from "moment";

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
        appointmentScheduledTimestamp: z.string().datetime(),
        appointmentArrivalTimestamp: z
          .string()
          .datetime()
          .optional()
          .nullable(),
        reservationType: z.nativeEnum(ReservationType)
      }),
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
      parsedBody.branch!.id!,
      { bank: true }
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

    const pendingAppointment = await this.service.findOne([
      { customer, status: AppointmentStatus.PENDING },
      { customer, status: AppointmentStatus.SERVING }
    ]);

    if (pendingAppointment)
      throw Error("Customer already has pending appointment");

    if (
      parsedBody.appointmentArrivalTimestamp &&
      parsedBody.reservationType === ReservationType.ONLINE
    ) {
      throw new Error("Online appointment cannot have arrival timestamp");
    }

    parsedBody.bank = branch.bank;
    parsedBody.status = AppointmentStatus.PENDING;

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

    const appointment = await this.service.findOne(
      {
        customer: { id: user.id },
        status: AppointmentStatus.PENDING
      },
      { branch: true }
    );

    if (!appointment) {
      res.json({ data: { appointment: null } });
      return;
    }

    const appointmentCount = await this.service.count({
      branch: { id: appointment.branch.id },
      status: AppointmentStatus.PENDING
    });

    res.json({
      data: {
        appointment,
        appointmentsRemaining: appointmentCount
      }
    });
  }

  public async customerArrive(req: Request, res: Response): Promise<void> {
    const appointment = await this.service.findById(req.params.appointment, {
      bank: true,
      branch: true,
      service: true
    });

    if (!appointment) {
      res.status(400).json({ error: { message: "Appointment not found" } });
      return;
    }

    if (appointment.appointmentArrivalTimestamp !== null) {
      res.status(400).json({
        error: {
          message: "Appointment already has arrival timestamp"
        }
      });
      return;
    }

    await this.service.update(appointment.id, {
      appointmentArrivalTimestamp: new Date()
    });

    const service = this.service as AppointmentService;
    await service.addToken(
      appointment!,
      service.calculatePriority(appointment)
    );

    res.json({ data: { appointment } });
  }

  public async getNextToken(req: Request, res: Response) {
    let window: Window | null = null;
    let employee: Employee | null = null;

    try {
      const schema = z.object({
        window: z.object({ id: z.string().uuid() }).nullable().optional(),
        employee: z.object({ id: z.string().uuid() }).nullable().optional()
      });

      const parsedBody = schema.parse(req.body);

      if (parsedBody.window) {
        window = await Container.get(WindowService).findById(
          parsedBody.window!.id!,
          { branch: true }
        );
        if (!window) throw new Error("Window not found");
      }

      if (parsedBody.employee) {
        employee = await Container.get(EmployeeService).findById(
          parsedBody.employee!.id!
        );
        if (!employee) throw new Error("Employee not found");
      }
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: {
            message: "Invalid body",
            issues: error.issues.map((i) => `${i.path}: ${i.message}`)
          }
        });
        return;
      } else if (error instanceof Error) {
        res.status(400).json({ error: { message: error.message } });
        return;
      }
      return;
    }

    const service = this.service as AppointmentService;

    const now = moment();

    const previousAppointment = await service.findOne({
      window: { id: window!.id },
      status: AppointmentStatus.SERVING
    });

    console.log("previousAppointment:", previousAppointment);

    if (previousAppointment)
      await service.update(previousAppointment.id, {
        status: AppointmentStatus.COMPLETED,
        appointmentEndDate: now.toDate(),
        appointmentEndTime: now.format("hh:mm")
      });

    await service.updateAllTokens(window!.branch.id);
    const appointment = await service.getNextToken(window!.branch.id);

    if (!appointment) {
      res.json({ data: { appointment: null } });
      return;
    }

    await service.update(appointment.id, {
      employee,
      window,
      appointmentStartDate: now.toDate(),
      appointmentStartTime: now.format("hh:mm"),
      status: AppointmentStatus.SERVING
    });

    const allAppointmentData = await service.findById(appointment.id, {
      window: true,
      service: true,
      employee: true
    });

    res.json({ data: { appointment: allAppointmentData } });
  }
}
