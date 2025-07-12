import { Service } from "typedi";
import BaseService from "@/core/BaseService";
import { TemporaryAccess } from "@/models/TemporaryAccess";
import { User, UserRole } from "@/models/User";
import { DataSource, LessThan } from "typeorm";

@Service()
export class TemporaryAccessService extends BaseService<TemporaryAccess> {
  constructor() {
    super(TemporaryAccess);
  }

  async grantTemporaryAccess(
    user: User,
    newRole: string,
    expiresAt: Date,
    createdBy: User
  ) {
    // Validate and cast newRole
    if (!Object.values(UserRole).includes(newRole as UserRole)) {
      throw new Error("Invalid role");
    }
    const previousRole = user.role;
    user.role = newRole as UserRole;
    await this.repository.manager.save(user);

    const tempAccess = this.repository.create({
      user,
      previousRole,
      newRole,
      expiresAt,
      createdBy
    });
    return await this.repository.save(tempAccess);
  }

  async restoreRoleAndDeleteExpired(dataSource: DataSource) {
    const now = new Date();
    const expired = await this.repository.find({
      where: { expiresAt: LessThan(now) },
      relations: ["user"]
    });
    for (const temp of expired) {
      if (temp.user) {
        temp.user.role = temp.previousRole as UserRole;
        await dataSource.getRepository(User).save(temp.user);
      }
      await this.repository.delete(temp.id);
    }
    return expired.length;
  }
}
