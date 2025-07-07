import { User, UserRole } from "@/models/User";
import { Bank } from "@/models/Bank";
import { Branch } from "@/models/Branch";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { AppDataSource } from "@/config/data-source";
import bcrypt from "bcryptjs";

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
  private async generateEmail(firstName: string, lastName: string, role: UserRole): Promise<string> {
    const cleanFirstName = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanLastName = lastName.toLowerCase().replace(/[^a-z]/g, '');
    
    let email: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      switch (role) {
        case UserRole.ADMIN:
          if (attempts === 0) {
            email = `${cleanFirstName}.${cleanLastName}@admin.com`;
          } else {
            email = `${cleanFirstName}.${cleanLastName}${attempts}@admin.com`;
          }
          break;
        case UserRole.MANAGER:
          const randomNumber = Math.floor(Math.random() * 10);
          if (attempts === 0) {
            email = `${cleanFirstName}${randomNumber}@manager.com`;
          } else {
            email = `${cleanFirstName}${randomNumber}${attempts}@manager.com`;
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
          throw new Error('Invalid role for email generation');
      }

      // Check if email exists in User table
      const existingUser = await this.userRepository.findOne({ where: { email } });

      if (!existingUser) {
        return email; // Email is unique
      }

      attempts++;
    } while (attempts < maxAttempts);

    throw new Error('Unable to generate unique email after multiple attempts');
  }

  // Create new user directly (renamed from createAccessRequest)
  async createAccessRequest(data: {
    employeeId?: string; // Optional employee ID (ignored in processing)
    firstName: string;
    lastName: string;
    role: UserRole;
    password: string;
    bankId: string;
    branchId: string;
    createdById: string;
    notes?: string;
    email?: string; // Optional custom email
  }): Promise<User> {
    
    const { employeeId, firstName, lastName, role, password, bankId, branchId, createdById, email: customEmail } = data;

    // Note: employeeId is ignored since User model uses UUID as primary key

    // Validate bank and branch exist
    const bank = await this.bankRepository.findOne({ where: { id: bankId } });
    if (!bank) {
      throw new Error('Bank not found');
    }

    const branch = await this.branchRepository.findOne({ where: { id: branchId } });
    if (!branch) {
      throw new Error('Branch not found');
    }

    const createdBy = await this.userRepository.findOne({ where: { id: createdById } });
    if (!createdBy) {
      throw new Error('Creator user not found');
    }

    // Generate or use custom email
    let email: string;
    if (customEmail) {
      // Check if custom email is unique
      const existingUser = await this.userRepository.findOne({ where: { email: customEmail } });
      if (existingUser) {
        throw new Error('Email already exists');
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

  // Get all users (renamed from getAllAccessRequests)
  async getAllAccessRequests(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['bank', 'branch'],
      order: { createdAt: 'DESC' }
    });
  }

  // Get user by ID (renamed from getAccessRequestById)
  async getAccessRequestById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['bank', 'branch']
    });
  }

  // Update user role (renamed from approveAccess)
  async approveAccess(userId: string, approvedById: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bank', 'branch']
    });

    if (!user) {
      throw new Error('User not found');
    }

    const approvedBy = await this.userRepository.findOne({ where: { id: approvedById } });
    if (!approvedBy) {
      throw new Error('Approver user not found');
    }

    // User is already created and active, just return it
    return user;
  }

  // Delete user (renamed from rejectAccess)
  async rejectAccess(userId: string, approvedById: string, notes?: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const approvedBy = await this.userRepository.findOne({ where: { id: approvedById } });
    if (!approvedBy) {
      throw new Error('Approver user not found');
    }

    // Delete the user
    await this.userRepository.remove(user);

    return { message: 'User deleted successfully' };
  }

  // Get user by email or ID (renamed from getUserByEmployeeId)
  async getUserByEmployeeId(identifier: string): Promise<any> {
    // Check if identifier is email or UUID
    const isEmail = identifier.includes('@');
    
    const user = await this.userRepository.findOne({
      where: isEmail ? { email: identifier } : { id: identifier },
      relations: ['bank', 'branch']
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
  async updateUser(userId: string, data: {
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    bankId?: string;
    branchId?: string;
    email?: string;
    password?: string; // Added password update option
  }): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bank', 'branch']
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update full name if first or last name provided
    if (data.firstName || data.lastName) {
      const firstName = data.firstName || user.fullName.split(' ')[0];
      const lastName = data.lastName || user.fullName.split(' ').slice(1).join(' ');
      user.fullName = `${firstName} ${lastName}`;
    }

    // Update email if provided
    if (data.email) {
      const existingUser = await this.userRepository.findOne({ where: { email: data.email } });
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Email already exists');
      }
      user.email = data.email;
    }

    // Update password if provided (will be hashed by @BeforeUpdate)
    if (data.password) {
      user.password = data.password;
    }

    // Update role if provided
    if (data.role) {
      user.role = data.role;
    }

    // Update bank if provided
    if (data.bankId) {
      const bank = await this.bankRepository.findOne({ where: { id: data.bankId } });
      if (!bank) {
        throw new Error('Bank not found');
      }
      user.bank = bank;
    }

    // Update branch if provided
    if (data.branchId) {
      const branch = await this.branchRepository.findOne({ where: { id: data.branchId } });
      if (!branch) {
        throw new Error('Branch not found');
      }
      user.branch = branch;
    }

    return await this.userRepository.save(user);
  }

  // Validate user password
  async validateAccessPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return await user.validatePassword(password);
  }

  // Batch create users (renamed from batchApproveAccessRequests)
  async batchApproveAccessRequests(usersData: Array<{
    firstName: string;
    lastName: string;
    role: UserRole;
    password: string;
    bankId: string;
    branchId: string;
  }>, createdById: string): Promise<User[]> {
    const users: User[] = [];
    
    for (const userData of usersData) {
      try {
        const user = await this.createAccessRequest({
          ...userData,
          createdById
        });
        users.push(user);
      } catch (error) {
        console.error(`Failed to create user:`, error);
      }
    }
    
    return users;
  }

  // Get users by role
  async getUsersByRole(role: UserRole): Promise<User[]> {
    return await this.userRepository.find({
      where: { role },
      relations: ['bank', 'branch'],
      order: { createdAt: 'DESC' }
    });
  }

  // Get users by bank
  async getUsersByBank(bankId: string): Promise<User[]> {
    return await this.userRepository.find({
      where: { bank: { id: bankId } },
      relations: ['bank', 'branch'],
      order: { createdAt: 'DESC' }
    });
  }

  // Get users by branch
  async getUsersByBranch(branchId: string): Promise<User[]> {
    return await this.userRepository.find({
      where: { branch: { id: branchId } },
      relations: ['bank', 'branch'],
      order: { createdAt: 'DESC' }
    });
  }

  // Change user password
  async changeUserPassword(userId: string, newPassword: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    // Update password (will be hashed by User model's @BeforeUpdate)
    user.password = newPassword;
    return await this.userRepository.save(user);
  }
}