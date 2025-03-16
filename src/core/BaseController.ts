import { Request, Response } from "express";
import { z, ZodType } from "zod";
import BaseService from "./BaseService";
import { DeepPartial, ObjectLiteral } from "typeorm";
import Container from "typedi";

export interface BaseControllerOptions<T extends ObjectLiteral> {
  keySingle: string;
  keyPlural: string;
  schema: ZodType<DeepPartial<T>>;
  updateSchema?: ZodType<DeepPartial<T>>;
}

const uuidSchema = z.string().uuid();

export abstract class BaseController<T extends ObjectLiteral> {
  private keySingle: string;
  private keyPlural: string;
  private schema: ZodType<DeepPartial<T>>;
  private updateSchema?: ZodType<DeepPartial<T>>;

  public constructor(
    private serviceClass: new () => BaseService<T>,
    options: BaseControllerOptions<T>
  ) {
    this.keySingle = options.keySingle;
    this.keyPlural = options.keyPlural;
    this.schema = options.schema;
    this.updateSchema = options.updateSchema;
  }

  private get service(): BaseService<T> {
    return Container.get(this.serviceClass);
  }

  private isValidUUID(id: string) {
    try {
      uuidSchema.parse(id);
      return true;
    } catch {
      return false;
    }
  }

  public async list(req: Request, res: Response): Promise<void> {
    const entities = await this.service.findAll();

    res.json({ data: { [this.keyPlural]: entities } });
  }

  public async getId(req: Request, res: Response): Promise<void> {
    const id = req.params[this.keySingle];

    if (!this.isValidUUID(id)) {
      res.status(400).json({ error: { message: "Invalid parameter ID" } });
      return;
    }

    const entity = await this.service.findById(id);

    if (!entity) {
      res.status(404).json({ error: { message: "Not found" } });
      return;
    }

    res.json({ data: { [this.keySingle]: entity } });
  }

  public async post(req: Request, res: Response): Promise<void> {
    const parsedBody = this.schema.safeParse(req.body);
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
    const id = req.params[this.keySingle];

    if (!this.isValidUUID(id)) {
      res.status(400).json({ error: { message: "Invalid parameter ID" } });
      return;
    }

    const parsedBody = (this.updateSchema || this.schema).safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({ error: { message: parsedBody.error.message } });
      return;
    }

    try {
      const bank = this.service.update(id, parsedBody.data);
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
    const id = req.params[this.keySingle];

    if (!this.isValidUUID(id)) {
      res.status(400).json({ error: { message: "Invalid parameter ID" } });
      return;
    }

    const deleted = await this.service.delete(id);

    if (!deleted) {
      res.status(404).json({ error: { message: "Not found" } });
      return;
    }

    res.json({ data: { deleted } });
  }
}
