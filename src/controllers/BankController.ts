import { BankService } from "@/services/BankService";
import { Request, Response } from "express";
import Container, { Service } from "typedi";
import { z } from "zod";

@Service()
export class BankController {
  private get service() {
    return Container.get(BankService);
  }

  public async list(req: Request, res: Response): Promise<void> {
    const banks = await this.service.findAll();

    res.json({ data: { banks } });
  }

  public async getId(req: Request, res: Response): Promise<void> {
    const bankId = req.params.bank;

    const bank = await this.service.findById(bankId);

    if (!bank) {
      res.status(404).json({ error: { message: "Not found" } });
      return;
    }

    res.json({ data: { bank } });
  }

  public async post(req: Request, res: Response): Promise<void> {
    const bodySchema = z.object({
      name: z.string({ message: "Missing body key [name]" })
    });

    const parsedBody = bodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({ error: { message: parsedBody.error.message } });
      return;
    }

    try {
      const bank = await this.service.create(parsedBody.data);
      res.json({ data: { bank } });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        res.status(500).json({ error: { message: "Internal server error" } });
        return;
      }
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    const bodySchema = z.object({
      name: z.string({ message: "Missing body key [name]" })
    });

    const parsedBody = bodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({ error: { message: parsedBody.error.message } });
      return;
    }

    try {
      const bank = this.service.update(req.params.bank, parsedBody.data);
      res.json({ data: { bank } });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        res.status(500).json({ error: { message: "Internal server error" } });
        return;
      }
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    const bankId = req.params.bank;

    const deleted = await this.service.delete(bankId);

    if (!deleted) {
      res.status(404).json({ error: { message: "Not found" } });
      return;
    }

    res.json({ data: { deleted } });
  }
}
