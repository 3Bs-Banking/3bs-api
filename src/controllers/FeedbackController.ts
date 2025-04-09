import { BaseController } from "@/core/BaseController";
import { Feedback } from "@/models/Feedback";
import { AppointmentService } from "@/services/AppointmentService";
import { EmployeeService } from "@/services/EmployeeService";
import { FeedbackService } from "@/services/FeedbackService";
import Container, { Service } from "typedi";
import { z, ZodType } from "zod";

@Service()
export class FeedbackController extends BaseController<Feedback> {
  public constructor() {
    super(FeedbackService, {
      keySingle: "feedback",
      keyPlural: "feedbacks",
      schema: z.object({
        satisfactionRating: z.number().int().min(1).max(5),
        timeResolutionRating: z.number().int().min(1).max(5),
        comment: z.string().nullable().optional(),
        appointment: z.object({ id: z.string().uuid() }),
        employee: z.object({ id: z.string().uuid() }).nullable().optional()
      }) as unknown as ZodType<Partial<Feedback>>
    });
  }

  protected async validatePostBody(body: Request["body"]) {
    const parsedBody = await super.validatePostBody(body);

    const appointment = await Container.get(AppointmentService).findById(
      parsedBody.appointment!.id!
    );
    if (!appointment) throw new Error("Appointment not found");

    if (parsedBody.employee) {
      const employee = await Container.get(EmployeeService).findById(
        parsedBody.employee.id!
      );
      if (!employee) throw new Error("Employee not found");
    }

    return parsedBody;
  }
}
