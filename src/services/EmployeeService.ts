import BaseService from "@/core/BaseService";
import { Employee } from "@/models/Employee";
import { Service } from "typedi";

@Service()
export class EmployeeService extends BaseService<Employee> {
  constructor() {
    super(Employee);
  }
}
