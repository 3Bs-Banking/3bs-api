import BaseService from "@/core/BaseService";
import { Bank } from "@/models/Bank";
import { Service } from "typedi";

@Service()
export class BankService extends BaseService<Bank> {
  constructor() {
    super(Bank);
  }
}
