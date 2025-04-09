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
        window: z.object({ id: z.string().uuid() }),
        employee: z.object({ id: z.string().uuid() }).nullable(),
        appointmentStartDate: z.string().min(1, "Start date is required"),
        appointmentStartTime: z.string().min(1, "Start time is required"),
        appointmentEndDate: z.string().nullable().optional(),
        appointmentEndTime: z.string().nullable().optional(),
        status: z.nativeEnum(AppointmentStatus),
        reservationType: z.nativeEnum(ReservationType)
      }) as unknown as ZodType<Partial<Appointment>>
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

    const window = await Container.get(CustomerService).findById(
      parsedBody.window!.id!
    );
    if (!window) throw new Error("Window not found");

    if (parsedBody.employee) {
      const employee = await Container.get(EmployeeService).findById(
        parsedBody.employee!.id!
      );
      if (!employee) throw new Error("Employee not found");
    }

    return parsedBody;
  }
}
