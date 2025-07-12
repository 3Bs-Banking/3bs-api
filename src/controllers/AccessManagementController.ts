import { Request, Response } from "express";
import { AccessManagementService } from "@/services/AccessManagementService";
import { UserRole } from "@/models/User";
import Container, { Service } from "typedi";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';

@Service()
export class AccessManagementController {
  private accessService: AccessManagementService;

  constructor() {
    this.accessService = Container.get(AccessManagementService);
  }

  // Generate employee ID helper function
  private generateEmployeeId(): string {
    return 'EMP-' + uuidv4().substring(0, 8).toUpperCase();
  }

  // Create user directly (renamed from createAccess)
  async createAccess(req: Request, res: Response): Promise<void> {
    try {
      const schema = z.object({
        employeeId: z.string().optional(), // Optional for new employees
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        role: z.nativeEnum(UserRole),
        password: z.string().min(6, "Password must be at least 6 characters"),
        bankId: z.string().uuid("Invalid bank ID"),
        branchId: z.string().uuid("Invalid branch ID"),
        email: z.string().email().optional(),
        notes: z.string().optional(),
        accessType: z.enum(['new', 'escalation']).optional().default('new')
      });

      const validatedData = schema.parse(req.body);
      const createdById = req.user!.id;

      // Auto-generate employee ID for new employees if not provided
      let employeeId = validatedData.employeeId;
      if (validatedData.accessType === 'new' && !employeeId) {
        employeeId = this.generateEmployeeId();
      }

      // Prepare user data
      const userData = {
        employeeId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: validatedData.role,
        password: validatedData.password, // Send plain password - User entity will encrypt it
        bankId: validatedData.bankId,
        branchId: validatedData.branchId,
        email: validatedData.email,
        notes: validatedData.notes,
        createdById
      };

      const user = await this.accessService.createAccessRequest(userData);

      res.status(201).json({
        success: true,
        message: validatedData.accessType === 'escalation' 
          ? "Privilege escalation request created successfully" 
          : "New employee access request created successfully",
        data: { 
          user,
          employeeId: employeeId // Return the employee ID (generated or provided)
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  // Get all users (renamed from getAllAccess)
  async getAllAccess(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.accessService.getAllAccessRequests();

      res.json({
        success: true,
        data: { users }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  // Get user by ID (renamed from getAccessById)
  async getAccessById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.accessService.getAccessRequestById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found"
        });
        return;
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  // Activate/verify user (renamed from approveAccess)
  async approveAccess(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const approvedById = req.user!.id;

      const user = await this.accessService.approveAccess(id, approvedById);

      res.json({
        success: true,
        message: "User verified successfully",
        data: { user }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  // Delete user (renamed from rejectAccess)
  async rejectAccess(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const approvedById = req.user!.id;

      const result = await this.accessService.rejectAccess(id, approvedById, notes);

      res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  // Check if user exists by email or ID (renamed from checkEmployee)
  async checkEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params; // This can now be email or UUID
      const result = await this.accessService.getUserByEmployeeId(employeeId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  // Update user details
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const schema = z.object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        role: z.nativeEnum(UserRole).optional(),
        bankId: z.string().uuid().optional(),
        branchId: z.string().uuid().optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional() // Plain password - User entity will encrypt
      });

      const validatedData = schema.parse(req.body);
      const user = await this.accessService.updateUser(id, validatedData);

      res.json({
        success: true,
        message: "User updated successfully",
        data: { user }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  // Get users by role
  async getUsersByRole(req: Request, res: Response): Promise<void> {
    try {
      const { role } = req.params;
      
      if (!Object.values(UserRole).includes(role as UserRole)) {
        res.status(400).json({
          success: false,
          message: "Invalid role"
        });
        return;
      }

      const users = await this.accessService.getUsersByRole(role as UserRole);

      res.json({
        success: true,
        data: { users }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  // Get users by bank
  async getUsersByBank(req: Request, res: Response): Promise<void> {
    try {
      const { bankId } = req.params;
      const users = await this.accessService.getUsersByBank(bankId);

      res.json({
        success: true,
        data: { users }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  // Get users by branch
  async getUsersByBranch(req: Request, res: Response): Promise<void> {
    try {
      const { branchId } = req.params;
      const users = await this.accessService.getUsersByBranch(branchId);

      res.json({
        success: true,
        data: { users }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  // Change user password
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const schema = z.object({
        newPassword: z.string().min(6, "Password must be at least 6 characters")
      });

      const { newPassword } = schema.parse(req.body);
      // Send plain password - User entity will encrypt it
      const user = await this.accessService.changeUserPassword(id, newPassword);

      res.json({
        success: true,
        message: "Password changed successfully",
        data: { user: { id: user.id, email: user.email } }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  // Validate user password
  async validatePassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const schema = z.object({
        password: z.string().min(1, "Password is required")
      });

      const { password } = schema.parse(req.body);
      const isValid = await this.accessService.validateAccessPassword(id, password);

      res.json({
        success: true,
        data: { isValid }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: (error as Error).message
      });
    }
  }
}