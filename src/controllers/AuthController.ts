import { User, UserRole } from "@/models/User";
import { UserService } from "@/services/UserService";
import { Request, Response, NextFunction } from "express";
import passport from "passport";
import Container from "typedi";
import { DeepPartial } from "typeorm";
import { z, ZodType } from "zod";

export const register = async (req: Request, res: Response) => {
  const schema: ZodType<
    Exclude<DeepPartial<User>, "bank" | "branch"> & {
      bank: string;
      branch: string;
    }
  > = z.object({
    fullName: z.string({ message: "Missing body parameter [fullName]" }),
    email: z
      .string({ message: "Missing body parameter [email]" })
      .email("Invalid email"),
    password: z.string({ message: "Missing body parameter [password]" }),
    bank: z.string({ message: "Missing body parameter [bank]" }),
    branch: z.string({ message: "Missing body parameter [branch]" }),
    role: z.nativeEnum(UserRole)
  });

  const parsedBody = schema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({
      error: {
        message: "Invalid body",
        issues: parsedBody.error.issues.map((i) => `${i.path}: ${i.message}`)
      }
    });
    return;
  }

  const userService = Container.get(UserService);

  try {
    const user = await userService.create(parsedBody.data);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    (err: Error | null, user: Express.User, info: { message: string }) => {
      if (err) return next(err);
      if (!user)
        return res.status(401).json({ error: { message: info.message } });

      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({ message: "Logged in successfully", user });
      });
    }
  )(req, res, next);
};

export const logout = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err)
      return res.status(500).json({ error: { message: "Logout failed" } });
    res.json({ data: { message: "Logged out successfully" } });
  });
};
