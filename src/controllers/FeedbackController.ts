import { BaseController } from "@/core/BaseController";
import { Feedback } from "@/models/Feedback";
import { FeedbackService } from "@/services/FeedbackService";
import { Service } from "typedi";
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
}
