import BaseService from "@/core/BaseService";
import { Appointment } from "@/models/Appointment";
import { Service } from "typedi";

@Service()
export class AppointmentService extends BaseService<Appointment> {
  constructor() {
    super(Appointment);
  }
}
