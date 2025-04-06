import { UserRole } from "@/models/User";
import { UserService } from "@/services/UserService";
import { Request, Response, NextFunction } from "express";
import Container from "typedi";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: { message: "Unauthorized" } });
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    const userService = Container.get(UserService);
    const user = (await userService.findById(req.user.id))!;
    if (user.role === UserRole.ADMIN) return next();
  }
  res.status(401).json({ error: { message: "Unauthorized" } });
};

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
    }
  }
}
