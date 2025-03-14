import BaseService from "@/core/BaseService";
import { Customer } from "@/models/Customer";
import { Service } from "typedi";

@Service()
export class CustomerService extends BaseService<Customer> {
  constructor() {
    super(Customer);
  }
}
