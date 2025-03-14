import BaseService from "@/core/BaseService";
import { Branch } from "@/models/Branch";
import { Service } from "typedi";

@Service()
export class BranchService extends BaseService<Branch> {
  constructor() {
    super(Branch);
  }
}
