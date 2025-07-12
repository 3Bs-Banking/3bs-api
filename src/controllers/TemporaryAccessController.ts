import { Request, Response } from "express";
import { Service } from "typedi";
import { TemporaryAccessService } from "@/services/TemporaryAccessService";
import { UserService } from "@/services/UserService";
import { UserRole } from "@/models/User";
import { z } from "zod";

@Service()
export class TemporaryAccessController {
  constructor(
    private tempAccessService: TemporaryAccessService,
    private userService: UserService
  ) {}

  // List all temporary access records
  async list(req: Request, res: Response): Promise<void> {
    const records = await this.tempAccessService.findAll();
    res.json({ data: { temporaryAccesses: records } });
  }

  // Get a specific temporary access record by ID
  async getId(req: Request, res: Response): Promise<void> {
    const id = req.params.temporaryAccess;
    const record = await this.tempAccessService.findById(id);
    if (!record) {
      res.status(404).json({ error: { message: "Not found" } });
      return;
    }
    res.json({ data: { temporaryAccess: record } });
  }

  // Create a new temporary access record (grant access)
  async post(req: Request, res: Response): Promise<void> {
    // This can be used for generic creation if needed
    res
      .status(501)
      .json({ error: { message: "Not implemented. Use /grant endpoint." } });
  }

  // Update a temporary access record (if needed)
  async update(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: { message: "Not implemented." } });
  }

  // Delete a temporary access record (manual removal, if needed)
  async delete(req: Request, res: Response): Promise<void> {
    const id = req.params.temporaryAccess;
    const deleted = await this.tempAccessService.delete(id);
    if (!deleted) {
      res.status(404).json({ error: { message: "Not found" } });
      return;
    }
    res.json({ data: { deleted: true } });
  }

  // Custom endpoint: Check if a user exists (for employee lookup in frontend)
  async checkUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const user = await this.userService.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.json({ success: true, data: user });
  }

  // Custom endpoint: Grant temporary access (with password verification, etc.)
  async grant(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      userId: z.string().uuid(),
      newRole: z.nativeEnum(UserRole),
      expiresAt: z.string(),
      password: z.string()
    });

    let parsed;
    try {
      parsed = schema.parse(req.body);
    } catch (err) {
      res
        .status(400)
        .json({ success: false, message: "Invalid request", error: err });
      return;
    }

    // Get assigner (from session, or req.user)
    const assigner = await this.userService.findById(req.user?.id!);
    if (!assigner) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Verify password
    const valid = await assigner.validatePassword(parsed.password);
    if (!valid) {
      res.status(403).json({ success: false, message: "Invalid password" });
      return;
    }

    // Get target user
    const user = await this.userService.findById(parsed.userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Grant temporary access (store previous role, update user, create temp record)
    const tempAccess = await this.tempAccessService.grantTemporaryAccess(
      user,
      parsed.newRole,
      new Date(parsed.expiresAt),
      assigner
    );

    res.json({ success: true, data: tempAccess });
  }
}
