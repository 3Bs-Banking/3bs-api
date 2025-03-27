import { BaseController } from "@/core/BaseController";
import { Appointment } from "@/models/Appointment";
import { AppointmentService } from "@/services/AppointmentService";
import { AppointmentStatus, ReservationType } from "@/models/Appointment";
import { Service } from "typedi";
import { z, ZodType } from "zod";

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
        reservationType: z.nativeEnum(ReservationType),
        feedback: z.object({ id: z.string().uuid() }).nullable().optional()
      }) as unknown as ZodType<Partial<Appointment>>
    });
  }
}
