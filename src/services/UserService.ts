import BaseService from "@/core/BaseService";
import { User, UserRole } from "@/models/User";
import { Employee } from "@/models/Employee";
import { Service } from "typedi";
import { DeepPartial, getRepository } from "typeorm";
import { FindOptionsRelations } from "typeorm";

@Service()
export class UserService extends BaseService<User> {
  getUserWithRelations(userId: string) {
      throw new Error("Method not implemented.");
  }
  canAccessUserProfile(id: string, id1: string) {
      throw new Error("Method not implemented.");
  }
  canUpdateUserProfile(requesterId: string, id: string) {
      throw new Error("Method not implemented.");
  }
  updateUserProfile(id: string, validatedData: { email?: string | undefined; role?: UserRole | undefined; fullName?: string | undefined; bankId?: string | undefined; branchId?: string | undefined; }, requesterId: string) {
      throw new Error("Method not implemented.");
  }
  changeUserPassword(id: string, currentPassword: string, newPassword: string, requesterId: string) {
      throw new Error("Method not implemented.");
  }
  validateUserPassword(id: string, password: any) {
      throw new Error("Method not implemented.");
  }
  getCompleteUserProfile(id: string) {
      throw new Error("Method not implemented.");
  }
  updateCompleteUserProfile(id: string, validatedData: { email?: string | undefined; role?: UserRole | undefined; fullName?: string | undefined; phoneNumber?: string | undefined; profileSettings?: { notifications?: boolean | undefined; privacy?: string | undefined; theme?: string | undefined; } | undefined; bankId?: string | undefined; branchId?: string | undefined; }, requesterId: string) {
      throw new Error("Method not implemented.");
  }
  deleteUser(id: string, requesterId: string) {
      throw new Error("Method not implemented.");
  }
  getUserActivityLog(id: string) {
      throw new Error("Method not implemented.");
  }
  constructor() {
    
    super(User);
  }
async findById(id: string, relations?: FindOptionsRelations<User>): Promise<User | null> {
  return this.repository.findOne({
    where: { id },
    relations: relations as any
  });
}


  async create(data: DeepPartial<User>): Promise<User> {
    const existingUser = await this.repository.findOne({
      where: { email: data.email }
    });

    if (existingUser) throw new Error("User already exists");

    // If creating an EMPLOYEE user, also create/link Employee record
    if (data.role === UserRole.EMPLOYEE) {
      // Check if employee with same email exists
      const employeeRepo = this.repository.manager.getRepository(Employee);
      const existingEmployee = await employeeRepo.findOne({
        where: { email: data.email }
      });

      if (existingEmployee) {
        // Link existing employee to new user
        const user = await super.create(data);
        existingEmployee.user = user;
        await employeeRepo.save(existingEmployee);
        return user;
      } else {
        // Create new employee record along with user
        const user = await super.create(data);
        const employee = employeeRepo.create({
          fullName: data.fullName,
          email: data.email,
          bank: data.bank,
          branch: data.branch,
          user: user
        });
        await employeeRepo.save(employee);
        return user;
      }
    }

    return super.create(data);
  }
}