/* eslint-disable indent */
import { User, UserRole } from "@/models/User";
import { Bank } from "@/models/Bank";
import { Branch } from "@/models/Branch";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { AppDataSource } from "@/config/data-source";

@Service()
export class AccessManagementService {
  private userRepository: Repository<User>;
  private bankRepository: Repository<Bank>;
  private branchRepository: Repository<Branch>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.bankRepository = AppDataSource.getRepository(Bank);
    this.branchRepository = AppDataSource.getRepository(Branch);
  }

  // Generate email based on role and name with duplicate checking
  private async generateEmail(
    firstName: string,
    lastName: string,
    role: UserRole
  ): Promise<string> {
    const cleanFirstName = firstName.toLowerCase().replace(/[^a-z]/g, "");
    const cleanLastName = lastName.toLowerCase().replace(/[^a-z]/g, "");

    let email: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      switch (role) {
        case UserRole.ADMIN:
          if (attempts === 0) {
            email = `${cleanFirstName}.${cleanLastName}@bbb.admin.com`;
          } else {
            email = `${cleanFirstName}.${cleanLastName}${attempts}@bbb.admin.com`;
          }
          break;
        case UserRole.MANAGER:
          const randomNumber = Math.floor(Math.random() * 10);
          if (attempts === 0) {
            email = `${cleanFirstName}.${cleanLastName}${randomNumber}@bbb.manager.com`;
          } else {
            email = `${cleanFirstName}.${cleanLastName}${randomNumber}${attempts}@bbb.manager.com`;
          }
          break;
        case UserRole.EMPLOYEE:
          if (attempts === 0) {
            email = `${cleanFirstName}.${cleanLastName}@bbb.emp.com`;
          } else {
            email = `${cleanFirstName}.${cleanLastName}${attempts}@bbb.emp.com`;
          }
          break;
        case UserRole.CUSTOMER:
          if (attempts === 0) {
            email = `${cleanFirstName}.${cleanLastName}@customer.com`;
          } else {
            email = `${cleanFirstName}.${cleanLastName}${attempts}@customer.com`;
          }
          break;
        default:
          throw new Error("Invalid role for email generation");
      }

      // Check if email exists in User table
      const existingUser = await this.userRepository.findOne({
        where: { email }
      });

      if (!existingUser) {
        return email; // Email is unique
      }

      attempts++;
    } while (attempts < maxAttempts);

    throw new Error("Unable to generate unique email after multiple attempts");
  }

  // NEW: Escalate user privileges (UPDATE existing user)
  async escalateUserPrivileges(data: {
    employeeId: string;
    newRole: UserRole;
    newPassword: string;
    notes?: string;
    escalatedById: string;
  }): Promise<User> {
    const { employeeId, newRole, newPassword, escalatedById } = data;

    // Find existing user by ID or email
    const isEmail = employeeId.includes("@");
    const existingUser = await this.userRepository.findOne({
      where: isEmail ? { email: employeeId } : { id: employeeId },
      relations: ["bank", "branch"]
    });

    if (!existingUser) {
      throw new Error("Employee not found");
    }

    // Validate escalator exists
    const escalatedBy = await this.userRepository.findOne({
      where: { id: escalatedById }
    });
    if (!escalatedBy) {
      throw new Error("Escalator user not found");
    }

    // Extract first and last name from existing user
    const nameParts = existingUser.fullName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    // Generate new email based on new role
    const newEmail = await this.generateEmail(firstName, lastName, newRole);

    // Update user with new role, email, and password
    existingUser.role = newRole;
    existingUser.email = newEmail;
    existingUser.password = newPassword; // Will be hashed by @BeforeUpdate hook

    // Save updated user
    const updatedUser = await this.userRepository.save(existingUser);

    console.log(`✅ User escalated: ${existingUser.fullName}`);
    console.log(`   🔄 Role: ${existingUser.role} → ${newRole}`);
    console.log(`   📧 Email: ${existingUser.email} → ${newEmail}`);
    console.log("   🔐 Password: Updated");

    return updatedUser;
  }

  // Create new user directly (for new employees only)
  async createAccessRequest(data: {
    employeeId?: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    password: string;
    bankId: string;
    branchId: string;
    createdById: string;
    notes?: string;
    email?: string;
  }): Promise<User> {
    const {
      firstName,
      lastName,
      role,
      password,
      bankId,
      branchId,
      createdById,
      email: customEmail
    } = data;

    // Validate bank and branch exist
    const bank = await this.bankRepository.findOne({ where: { id: bankId } });
    if (!bank) {
      throw new Error("Bank not found");
    }

    const branch = await this.branchRepository.findOne({
      where: { id: branchId }
    });
    if (!branch) {
      throw new Error("Branch not found");
    }

    const createdBy = await this.userRepository.findOne({
      where: { id: createdById }
    });
    if (!createdBy) {
      throw new Error("Creator user not found");
    }

    // Generate or use custom email
    let email: string;
    if (customEmail) {
      const existingUser = await this.userRepository.findOne({
        where: { email: customEmail }
      });
      if (existingUser) {
        throw new Error("Email already exists");
      }
      email = customEmail;
    } else {
      email = await this.generateEmail(firstName, lastName, role);
    }

    // Create user directly with plain password
    const user = this.userRepository.create({
      fullName: `${firstName} ${lastName}`,
      email,
      password, // Plain password - will be hashed by User model's @BeforeInsert
      role,
      bank,
      branch
    });

    const savedUser = await this.userRepository.save(user);
    return savedUser;
  }

  // Get all users
  async getAllAccessRequests(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ["bank", "branch"],
      order: { createdAt: "DESC" }
    });
  }

  // Get user by ID
  async getAccessRequestById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ["bank", "branch"]
    });
  }

  // Update user role
  async approveAccess(userId: string, approvedById: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["bank", "branch"]
    });

    if (!user) {
      throw new Error("User not found");
    }

    const approvedBy = await this.userRepository.findOne({
      where: { id: approvedById }
    });
    if (!approvedBy) {
      throw new Error("Approver user not found");
    }

    return user;
  }

  // Delete user
  async rejectAccess(
    userId: string,
    approvedById: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    notes?: string
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error("User not found");
    }

    const approvedBy = await this.userRepository.findOne({
      where: { id: approvedById }
    });
    if (!approvedBy) {
      throw new Error("Approver user not found");
    }

    await this.userRepository.remove(user);
    return { message: "User deleted successfully" };
  }

  // Get user by email or ID
  async getUserByEmployeeId(identifier: string): Promise<any> {
    const isEmail = identifier.includes("@");

    const user = await this.userRepository.findOne({
      where: isEmail ? { email: identifier } : { id: identifier },
      relations: ["bank", "branch"]
    });

    if (user) {
      return {
        exists: true,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          bankId: user.bank.id,
          bankName: user.bank.name,
          branchId: user.branch.id,
          branchName: user.branch.name,
          createdAt: user.createdAt
        }
      };
    }

    return { exists: false };
  }

  // Update user details
  async updateUser(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      role?: UserRole;
      bankId?: string;
      branchId?: string;
      email?: string;
      password?: string;
    }
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["bank", "branch"]
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Update full name if first or last name provided
    if (data.firstName || data.lastName) {
      const firstName = data.firstName || user.fullName.split(" ")[0];
      const lastName =
        data.lastName || user.fullName.split(" ").slice(1).join(" ");
      user.fullName = `${firstName} ${lastName}`;
    }

    // Update email if provided
    if (data.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email }
      });
      if (existingUser && existingUser.id !== userId) {
        throw new Error("Email already exists");
      }
      user.email = data.email;
    }

    // Update password if provided
    if (data.password) {
      user.password = data.password;
    }

    // Update role if provided - ALSO UPDATE EMAIL IF ROLE CHANGES
    if (data.role && data.role !== user.role) {
      user.role = data.role;

      // Regenerate email based on new role (unless custom email provided)
      if (!data.email) {
        const firstName = data.firstName || user.fullName.split(" ")[0];
        const lastName =
          data.lastName || user.fullName.split(" ").slice(1).join(" ");
        user.email = await this.generateEmail(firstName, lastName, data.role);
      }
    }

    // Update bank if provided
    if (data.bankId) {
      const bank = await this.bankRepository.findOne({
        where: { id: data.bankId }
      });
      if (!bank) {
        throw new Error("Bank not found");
      }
      user.bank = bank;
    }

    // Update branch if provided
    if (data.branchId) {
      const branch = await this.branchRepository.findOne({
        where: { id: data.branchId }
      });
      if (!branch) {
        throw new Error("Branch not found");
      }
      user.branch = branch;
    }

    return await this.userRepository.save(user);
  }

  // Validate user password
  async validateAccessPassword(
    userId: string,
    password: string
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error("User not found");
    }

    return await user.validatePassword(password);
  }

  // Batch create users
  async batchApproveAccessRequests(
    usersData: Array<{
      firstName: string;
      lastName: string;
      role: UserRole;
      password: string;
      bankId: string;
      branchId: string;
    }>,
    createdById: string
  ): Promise<User[]> {
    const users: User[] = [];

    for (const userData of usersData) {
      try {
        const user = await this.createAccessRequest({
          ...userData,
          createdById
        });
        users.push(user);
      } catch (error) {
        console.error("Failed to create user:", error);
      }
    }

    return users;
  }

  // Get users by role
  async getUsersByRole(role: UserRole): Promise<User[]> {
    return await this.userRepository.find({
      where: { role },
      relations: ["bank", "branch"],
      order: { createdAt: "DESC" }
    });
  }

  // Get users by bank
  async getUsersByBank(bankId: string): Promise<User[]> {
    return await this.userRepository.find({
      where: { bank: { id: bankId } },
      relations: ["bank", "branch"],
      order: { createdAt: "DESC" }
    });
  }

  // Get users by branch
  async getUsersByBranch(branchId: string): Promise<User[]> {
    return await this.userRepository.find({
      where: { branch: { id: branchId } },
      relations: ["bank", "branch"],
      order: { createdAt: "DESC" }
    });
  }

  // Change user password
  async changeUserPassword(userId: string, newPassword: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error("User not found");
    }

    user.password = newPassword;
    return await this.userRepository.save(user);
  }
}
