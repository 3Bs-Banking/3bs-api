import BaseService from "@/core/BaseService";
import { User } from "@/models/User";
import { Service } from "typedi";
import { DeepPartial } from "typeorm";

@Service()
export class UserService extends BaseService<User> {
  constructor() {
    super(User);
  }

  async create(data: DeepPartial<User>): Promise<User> {
    const existingUser = await this.repository.findOne({
      where: { email: data.email }
    });

    if (existingUser) throw new Error("User already exists");

    return super.create(data);
  }
}
