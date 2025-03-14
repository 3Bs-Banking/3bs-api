import BaseService from "@/core/BaseService";
import { Feedback } from "@/models/Feedback";
import { Service } from "typedi";

@Service()
export class FeedbackService extends BaseService<Feedback> {
  constructor() {
    super(Feedback);
  }
}
