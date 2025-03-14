import BaseService from "@/core/BaseService";
import { User } from "@/models/User";
import { Service } from "typedi";

@Service()
export class UserService extends BaseService<User> {
  constructor() {
    super(User);
  }
}
