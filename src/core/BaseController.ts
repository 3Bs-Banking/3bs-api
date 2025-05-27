import { Request, Response } from "express";
import { z, ZodError, ZodType } from "zod";
import BaseService from "./BaseService";
import {
  DeepPartial,
  FindOptionsRelations,
  FindOptionsWhere,
  ObjectLiteral
} from "typeorm";
import Container from "typedi";

/**
 * Interface defining the options for configuring a BaseController.
 * @template T - The entity type.
 */
export interface BaseControllerOptions<T extends ObjectLiteral> {
  /**
   * Name of entity in singular form.
   */
  keySingle: string;

  /**
   * Name of entity in plural form.
   */
  keyPlural: string;

  /**
   * Schema to use for post requests.
   */
  schema: ZodType<DeepPartial<T>>;

  /**
   * Schema to use for update requests.
   */
  updateSchema?: ZodType<DeepPartial<T>>;

  /**
   * Relations to include while querying db.
   */
  relations?: FindOptionsRelations<T>;
}

const uuidSchema = z.string().uuid();

/**
 * Abstract base controller for handling CRUD operations.
 * @template T - The entity type.
 */
export abstract class BaseController<T extends ObjectLiteral> {
  private keySingle: string;
  private keyPlural: string;
  private schema: ZodType<DeepPartial<T>>;
  private updateSchema?: ZodType<DeepPartial<T>>;
  private relations?: FindOptionsRelations<T>;

  /**
   * Creates an instance of BaseController.
   * @param serviceClass - The service class responsible for entity operations.
   * @param options - Configuration options for the controller.
   */
  public constructor(
    private serviceClass: new () => BaseService<T>,
    options: BaseControllerOptions<T>
  ) {
    this.keySingle = options.keySingle;
    this.keyPlural = options.keyPlural;
    this.schema = options.schema;
    this.updateSchema = options.updateSchema;
    this.relations = options.relations;
  }

  /**
   * Retrieves the service instance from the container.
   * @returns The service instance.
   */
  private get service(): BaseService<T> {
    return Container.get(this.serviceClass);
  }

  /**
   * Validates if a given ID is a valid UUIDv4.
   * @param id - The ID to validate.
   * @returns True if the ID is a valid UUIDv4, otherwise false.
   */
  private isValidUUID(id: string): boolean {
    try {
      uuidSchema.parse(id);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Applies a filter to query functions.
   * @param req - The request object.
   * @returns FindOptionsWhere<T> instance to use in filter.
   */
  protected async getScopedWhere(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    req: Request
  ): Promise<FindOptionsWhere<T> | null> {
    return {};
  }

  /**
   * Handles the request to list all entities.
   * @param req - The request object.
   * @param res - The response object.
   */
  public async list(req: Request, res: Response): Promise<void> {
    const scopedWhere = await this.getScopedWhere(req);

    const entities =
      scopedWhere === null
        ? []
        : await this.service.find(scopedWhere, this.relations);

    res.json({ data: { [this.keyPlural]: entities } });
  }

  /**
   * Handles the request to get an entity by ID.
   * @param req - The request object.
   * @param res - The response object.
   */
  public async getId(req: Request, res: Response): Promise<void> {
    const id = req.params[this.keySingle];

    if (!this.isValidUUID(id)) {
      res.status(400).json({ error: { message: "Invalid parameter ID" } });
      return;
    }

    const scopedWhere = await this.getScopedWhere(req);

    const entity =
      scopedWhere === null
        ? null
        : await this.service.findOne({ ...scopedWhere, id }, this.relations);

    if (!entity) {
      res.status(404).json({ error: { message: "Not found" } });
      return;
    }

    res.json({ data: { [this.keySingle]: entity } });
  }

  /**
   * Validates post body.
   * Useful when having customized validation rules.
   * @param body - The request body.
   * @returns The parsed body
   */
  protected async validatePostBody(body: Request["body"]) {
    return this.schema.parse(body);
  }

  /**
   * Handles the request to create a new entity.
   * @param req - The request object.
   * @param res - The response object.
   */
  public async post(req: Request, res: Response): Promise<void> {
    let parsedBody: DeepPartial<T>;

    try {
      parsedBody = await this.validatePostBody(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: {
            message: "Invalid body",
            issues: error.issues.map((i) => `${i.path}: ${i.message}`)
          }
        });
        return;
      } else if (error instanceof Error) {
        res.status(400).json({ error: { message: error.message } });
        return;
      }
      return;
    }

    try {
      const entity = await this.service.create(parsedBody);
      res.json({ data: { [this.keySingle]: entity } });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        res.status(500).json({ error: { message: "Internal server error" } });
      }
    }
  }

  /**
   * Validates update body.
   * Useful when having customized validation rules.
   * @param body - The request body.
   * @returns The parsed body
   */
  protected async validateUpdateBody(body: Request["body"]) {
    return (this.updateSchema || this.schema).parse(body);
  }

  /**
   * Handles the request to update an existing entity.
   * @param req - The request object.
   * @param res - The response object.
   */
  public async update(req: Request, res: Response): Promise<void> {
    const id = req.params[this.keySingle];

    if (!this.isValidUUID(id)) {
      res.status(400).json({ error: { message: "Invalid parameter ID" } });
      return;
    }

    let parsedBody: DeepPartial<T>;

    try {
      parsedBody = await this.validateUpdateBody(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: {
            message: "Invalid body",
            issues: error.issues.map((i) => `${i.path}: ${i.message}`)
          }
        });
        return;
      } else if (error instanceof Error) {
        res.status(400).json({ error: { message: error.message } });
        return;
      }
      return;
    }

    try {
      const scopedWhere = await this.getScopedWhere(req);

      let entity =
        scopedWhere === null
          ? null
          : await this.service.findOne({ ...scopedWhere, id });
      if (!entity) {
        res.status(404).json({ error: { message: "Not found" } });
        return;
      }
      entity = await this.service.update(id, parsedBody);
      res.json({ data: { [this.keySingle]: entity } });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        res.status(500).json({ error: { message: "Internal server error" } });
      }
    }
  }

  /**
   * Handles the request to delete an entity by ID.
   * @param req - The request object.
   * @param res - The response object.
   */
  public async delete(req: Request, res: Response): Promise<void> {
    const id = req.params[this.keySingle];

    if (!this.isValidUUID(id)) {
      res.status(400).json({ error: { message: "Invalid parameter ID" } });
      return;
    }

    const scopedWhere = await this.getScopedWhere(req);

    let entity =
      scopedWhere === null
        ? null
        : await this.service.findOne({ ...scopedWhere, id });
    if (!entity) {
      res.status(404).json({ error: { message: "Not found" } });
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
